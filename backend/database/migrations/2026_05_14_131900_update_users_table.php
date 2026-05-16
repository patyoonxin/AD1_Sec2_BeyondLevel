<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            // Add address column
            $table->string('address')->default('');

            // Change email to nullable
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            // Remove columns
            $table->dropColumn(['phone_number', 'address']);

            // Change email back to NOT NULL
            $table->string('email')->nullable(false)->change();
        });
    }
};