<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * UC027: Generate Analytics Report
     *
     * Retrieves and compiles all relevant data from the database
     * to produce a structured analytics report for the admin.
     *
     * Supports report types:
     *   - monthly    : complaint statistics by month
     *   - chatbot    : (placeholder — extend when chatbot logs are available)
     *   - resolution : resolution rate by category
     *   - users      : user registration & activity summary
     *   - faq        : (placeholder)
     *   - escalation : (placeholder)
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function generate(Request $request): JsonResponse
    {
        $type = $request->input('type', 'monthly');

        // ── Shared base data ──────────────────────────────────────────────
        $complaints = Complaint::with('user')->get();

        $total = $complaints->count();
        $resolved = $complaints->where('status', 'Resolved')->count();
        $inProgress = $complaints->where('status', 'In Progress')->count();
        $pending = $complaints->where('status', 'Pending')->count();
        $rejected = $complaints->where('status', 'Rejected')->count();

        $resolutionRate = $total > 0 ? round(($resolved / $total) * 100, 1) : 0;

        // ── By status ─────────────────────────────────────────────────────
        $byStatus = [
            'Pending' => $pending,
            'In Progress' => $inProgress,
            'Resolved' => $resolved,
            'Rejected' => $rejected,
        ];

        // ── By category ───────────────────────────────────────────────────
        $byCategory = $complaints->groupBy('category')->map(fn($g) => $g->count())->toArray();

        // ── Monthly breakdown (last 12 months) ────────────────────────────
        $monthly = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $count = $complaints->filter(function ($c) use ($month) {
                return Carbon::parse($c->created_at)->format('Y-m') === $month->format('Y-m');
            })->count();
            $monthly[] = [
                'month' => $month->format('M Y'),
                'count' => $count,
            ];
        }

        // ── Resolution rate by category ───────────────────────────────────
        $resolutionByCategory = $complaints->groupBy('category')->map(function ($group) {
            $total = $group->count();
            $resolved = $group->where('status', 'Resolved')->count();
            return [
                'total' => $total,
                'resolved' => $resolved,
                'rate' => $total > 0 ? round(($resolved / $total) * 100, 1) : 0,
            ];
        })->toArray();

        // ── User stats ────────────────────────────────────────────────────
        $totalUsers = User::where('role', 'user')->count();
        $newUsersThisMonth = User::where('role', 'user')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // ── Raw rows for export (latest 100) ─────────────────────────────
        $rows = Complaint::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->map(fn($c) => [
                'record_id' => $c->record_id,
                'title' => $c->title,
                'category' => $c->category,
                'status' => $c->status,
                'location' => $c->location,
                'user_name' => $c->user?->name ?? '—',
                'created_at' => $c->created_at?->format('d M Y'),
                'updated_at' => $c->updated_at?->format('d M Y'),
            ]);

        return response()->json([
            'report_type' => $type,
            'generated_at' => Carbon::now()->toDateTimeString(),
            'summary' => [
                'total' => $total,
                'resolved' => $resolved,
                'in_progress' => $inProgress,
                'pending' => $pending,
                'rejected' => $rejected,
                'resolution_rate' => $resolutionRate,
                'total_users' => $totalUsers,
                'new_users_month' => $newUsersThisMonth,
            ],
            'by_status' => $byStatus,
            'by_category' => $byCategory,
            'monthly_breakdown' => $monthly,
            'resolution_by_category' => $resolutionByCategory,
            'rows' => $rows,
        ]);
    }

    /**
     * UC028: Export Analytics Report
     *
     * Prepares and returns report data in the requested format metadata.
     * Actual file generation (CSV / PDF) is handled client-side;
     * this endpoint validates the request and confirms readiness.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'format' => ['required', 'in:csv,pdf'],
            'type' => ['nullable', 'string'],
        ]);

        $format = $request->input('format');
        $type = $request->input('type', 'monthly');

        // Re-use generate logic to get the data
        $reportResponse = $this->generate($request);
        $reportData = json_decode($reportResponse->getContent(), true);

        return response()->json([
            'status' => 'ready',
            'format' => $format,
            'report_type' => $type,
            'exported_at' => Carbon::now()->toDateTimeString(),
            'data' => $reportData,
        ]);
    }

    /**
     * Quick summary stats for the analytics dashboard metrics cards.
     *
     * @return JsonResponse
     */
    public function summary(): JsonResponse
    {
        $complaints = Complaint::all();
        $total = $complaints->count();
        $resolved = $complaints->where('status', 'Resolved')->count();
        $inProgress = $complaints->where('status', 'In Progress')->count();
        $pending = $complaints->where('status', 'Pending')->count();

        return response()->json([
            'total' => $total,
            'resolved' => $resolved,
            'in_progress' => $inProgress,
            'pending' => $pending,
            'resolution_rate' => $total > 0 ? round(($resolved / $total) * 100, 1) : 0,
        ]);
    }
}