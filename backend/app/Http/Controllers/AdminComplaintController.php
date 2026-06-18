<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminComplaintController extends Controller
{
    /**
     * Display a paginated list of all submitted complaints.
     *
     * Admins can view complaints from all users across the system.
     * Results include the associated user data.
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $perPage = $request->input('per_page', 10);

        $query = Complaint::with(['user', 'responses.admin'])
            ->orderBy('created_at', 'desc');

        /*
         * Dates arrive as YYYY-MM-DD strings in the app timezone (Asia/Kuala_Lumpur).
         * The DB session is also set to +08:00, so no UTC conversion is needed.
         */
        $tz = config('app.timezone');

        if ($request->filled('start_date')) {
            $start = Carbon::createFromFormat('Y-m-d', $request->input('start_date'), $tz)->startOfDay();
            $query->where('created_at', '>=', $start);
        }

        if ($request->filled('end_date')) {
            $end = Carbon::createFromFormat('Y-m-d', $request->input('end_date'), $tz)->endOfDay();
            $query->where('created_at', '<=', $end);
        }

        $complaints = $query->paginate((int) $perPage);

        return response()->json($complaints);
    }

    /**
     * Display the full details of a specific complaint.
     *
     * Admins can view any complaint in the system regardless of ownership.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $complaint = Complaint::with(['user', 'responses.admin'])->findOrFail($id);

        return response()->json($complaint);
    }

    /**
     * Search across all complaints in the system.
     *
     * Supports filtering by record_id, description, location, status,
     * AI category, and the submitting user's name.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $query = Complaint::with('user');

        /*
        |--------------------------------------------------------------------------
        | Apply Search Filters
        |--------------------------------------------------------------------------
        | q         : general text search across multiple fields.
        | status    : exact status filter.
        | category  : exact category filter.
        | user_name : filter by the name of the user who submitted.
        */
        if ($request->filled('q')) {
            $searchTerm = $request->input('q');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('record_id', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('location', 'like', "%{$searchTerm}%")
                  ->orWhere('category', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('user_name')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->input('user_name') . '%');
            });
        }

        $perPage = $request->input('per_page', 10);
        $complaints = $query->orderBy('created_at', 'desc')->paginate((int) $perPage);

        return response()->json($complaints);
    }

    /**
     * Respond to a specific complaint.
     *
     * Allows an admin to provide an official written response to a
     * user's complaint. The response is stored in the admin_response column.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function respond(Request $request, int $id): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        | admin_response : required, at least 5 characters.
        | admin_id       : required, FK to the responding administrator.
        */
        $validated = $request->validate([
            'admin_response' => ['required', 'string', 'min:5'],
            'admin_id'       => ['required', 'integer', 'exists:users,id'],
        ]);

        $complaint = Complaint::findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Append a New Response
        |--------------------------------------------------------------------------
        | Creates a new row in `complaint_responses` so the full reply history
        | is preserved. Each response is linked to the responding admin and
        | timestamped automatically by Eloquent.
        */
        ComplaintResponse::create([
            'complaint_id' => $complaint->id,
            'admin_id'     => $validated['admin_id'],
            'message'      => $validated['admin_response'],
        ]);

        return response()->json([
            'message'   => 'Response submitted successfully.',
            'complaint' => $complaint->fresh(['user', 'responses.admin']),
        ]);
    }

    /**
     * Update the progress status of a complaint.
     *
     * Admins can transition a complaint to one of the four allowed states:
     * Pending, In Progress, Resolved, or Rejected.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        | status : must be one of the four defined lifecycle states.
        */
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['Pending', 'In Progress', 'Resolved', 'Rejected'])],
        ]);

        $complaint = Complaint::findOrFail($id);

        $complaint->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message'   => 'Status updated successfully.',
            'complaint' => $complaint->fresh('user'),
        ]);
    }
}
