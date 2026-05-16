<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faq;

class FaqController extends Controller
{
    // GET all FAQ
    public function index()
    {
        return Faq::all();
    }

    // GET one FAQ
    public function show($id)
    {
        return Faq::findOrFail($id);
    }

    // CREATE FAQ
    public function store(Request $request)
    {
        return Faq::create($request->all());
    }

    // UPDATE FAQ
    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);
        $faq->update($request->all());
        return $faq;
    }

    // DELETE FAQ
    public function destroy($id)
    {
        return Faq::destroy($id);
    }
}
