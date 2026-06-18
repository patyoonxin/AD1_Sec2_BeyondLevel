<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a synonyms JSON column to complaint_categories.
     *
     * Synonyms are alternative names / keywords that Gemini might return
     * for a category. The AI suggestion feature uses them to match Gemini
     * responses back to the canonical category name stored in the database.
     */
    public function up(): void
    {
        Schema::table('complaint_categories', function (Blueprint $table) {
            $table->json('synonyms')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('complaint_categories', function (Blueprint $table) {
            $table->dropColumn('synonyms');
        });
    }
};
