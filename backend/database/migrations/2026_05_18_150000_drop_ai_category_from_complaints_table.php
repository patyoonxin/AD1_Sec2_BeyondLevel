<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drops the ai_category column from the complaints table
     * in favor of a dynamic category system.
     */
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn('ai_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->string('ai_category')->after('attachments');
        });
    }
};
