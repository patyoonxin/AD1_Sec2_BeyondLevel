<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `complaint_responses` table which stores a thread of
     * admin replies for each complaint. Each row records the responding
     * admin (FK to users) along with the message body and timestamps,
     * allowing multiple chronological responses per complaint instead
     * of overwriting a single column.
     */
    public function up(): void
    {
        Schema::create('complaint_responses', function (Blueprint $table) {
            $table->id();

            // The complaint this reply belongs to
            $table->foreignId('complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            // The admin user who authored this response
            $table->foreignId('admin_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // The reply body
            $table->text('message');

            // Created/updated timestamps (also serves as the response timestamp)
            $table->timestamps();

            // Common access pattern: list responses for a specific complaint
            $table->index(['complaint_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_responses');
    }
};
