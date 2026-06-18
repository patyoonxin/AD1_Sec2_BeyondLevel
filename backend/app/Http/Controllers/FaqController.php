<?php
// ============================================================
// FILE: app/Http/Controllers/FaqController.php  (replace existing)
// Module 7 — FAQ & Knowledge Base Subsystem
// UC029, UC030, UC031, UC032
// ============================================================

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    // ──────────────────────────────────────────────────────────
    // UC029: View FAQ List
    // GET /api/faq
    // ──────────────────────────────────────────────────────────
    public function index()
    {
        try {
            $faqs = Faq::where('status', 'published')
                ->orderBy('category')
                ->orderBy('question_eng')
                ->get();

            // A1: No FAQ Available
            if ($faqs->isEmpty()) {
                return response()->json([
                    'message'  => 'No FAQ information available',
                    'has_data' => false,
                    'data'     => [],
                ], 200);
            }

            return response()->json([
                'has_data' => true,
                'data'     => $faqs,
            ]);

        } catch (\Exception $e) {
            // A2: Database Failure
            return response()->json([
                'message' => 'Unable to retrieve FAQ list',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // Admin: Get ALL FAQs including drafts
    // GET /api/admin/faq
    public function adminIndex()
    {
        try {
            $faqs = Faq::orderBy('category')->orderBy('question_eng')->get();

            return response()->json([
                'has_data' => $faqs->isNotEmpty(),
                'total'     => $faqs->count(),
                'published' => $faqs->where('status', 'published')->count(),
                'draft'     => $faqs->where('status', 'draft')->count(),
                'data'      => $faqs,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unable to retrieve FAQ list',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────
    // UC030: View FAQ Details
    // GET /api/faq/{id}
    // ──────────────────────────────────────────────────────────
    public function show($id)
    {
        try {
            $faq = Faq::find($id);

            // A1: FAQ Not Found
            if (!$faq) {
                return response()->json([
                    'message' => 'FAQ information not found',
                ], 404);
            }

            // Increment view count
            $faq->increment('views');

            return response()->json([
                'has_data' => true,
                'data'     => $faq,
            ]);

        } catch (\Exception $e) {
            // A2: Database Failure
            return response()->json([
                'message' => 'Unable to retrieve FAQ details',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────
    // UC031: Search FAQ Information
    // GET /api/faq/search?q=keyword
    // ──────────────────────────────────────────────────────────
    public function search(Request $request)
    {
        $keyword = trim($request->get('q', ''));

        // A2: Empty Search Input
        if (empty($keyword)) {
            return response()->json([
                'message' => 'Search field cannot be empty',
            ], 422);
        }

        try {
            $faqs = Faq::where('status', 'published')
                ->where(function ($query) use ($keyword) {
                    $query->where('question_eng',   'LIKE', "%{$keyword}%")
                          ->orWhere('answer_eng',   'LIKE', "%{$keyword}%")
                          ->orWhere('question_malay','LIKE', "%{$keyword}%")
                          ->orWhere('answer_malay',  'LIKE', "%{$keyword}%")
                          ->orWhere('keywords',       'LIKE', "%{$keyword}%")
                          ->orWhere('category',       'LIKE', "%{$keyword}%");
                })
                ->get();

            // A1: No Matching Results
            if ($faqs->isEmpty()) {
                return response()->json([
                    'message'  => 'No matching FAQ found',
                    'has_data' => false,
                    'data'     => [],
                ], 200);
            }

            return response()->json([
                'has_data' => true,
                'keyword'  => $keyword,
                'count'    => $faqs->count(),
                'data'     => $faqs,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unable to process search request',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────
    // UC032: Manage FAQ — Add FAQ
    // POST /api/admin/faq
    // ──────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'question_eng'   => 'required|string',
            'answer_eng'     => 'required|string',
            'question_malay' => 'required|string',
            'answer_malay'   => 'required|string',
            'keywords'       => 'nullable|string',
            'category'       => 'nullable|string',
            'status'         => 'nullable|in:published,draft',
        ]);

        try {
            $faq = Faq::create([
                'question_eng'   => $request->question_eng,
                'answer_eng'     => $request->answer_eng,
                'question_malay' => $request->question_malay,
                'answer_malay'   => $request->answer_malay,
                'keywords'       => $request->keywords,
                'category'       => $request->category ?? 'General',
                'status'         => $request->status ?? 'published',
                'views'          => 0,
            ]);

            return response()->json([
                'message' => 'FAQ created successfully',
                'data'    => $faq,
            ], 201);

        } catch (\Exception $e) {
            // A4: Database Failure
            return response()->json([
                'message' => 'Unable to process FAQ request',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────
    // UC032: Manage FAQ — Update FAQ
    // PUT /api/admin/faq/{id}
    // ──────────────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        try {
            $faq = Faq::find($id);

            if (!$faq) {
                return response()->json([
                    'message' => 'FAQ not found',
                ], 404);
            }

            $faq->update($request->only([
                'question_eng',
                'answer_eng',
                'question_malay',
                'answer_malay',
                'keywords',
                'category',
                'status',
            ]));

            return response()->json([
                'message' => 'FAQ updated successfully',
                'data'    => $faq,
            ]);

        } catch (\Exception $e) {
            // A4: Database Failure
            return response()->json([
                'message' => 'Unable to process FAQ request',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────
    // UC032: Manage FAQ — Delete FAQ
    // DELETE /api/admin/faq/{id}
    // ──────────────────────────────────────────────────────────
    public function destroy($id)
    {
        try {
            $faq = Faq::find($id);

            if (!$faq) {
                return response()->json([
                    'message' => 'FAQ not found',
                ], 404);
            }

            $faq->delete();

            return response()->json([
                'message' => 'FAQ deleted successfully',
            ]);

        } catch (\Exception $e) {
            // A4: Database Failure
            return response()->json([
                'message' => 'Unable to process FAQ request',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // Get FAQ categories list
    // GET /api/faq/categories
    public function categories()
    {
        $categories = Faq::where('status', 'published')
            ->select('category')
            ->distinct()
            ->pluck('category');

        return response()->json($categories);
    }
}
