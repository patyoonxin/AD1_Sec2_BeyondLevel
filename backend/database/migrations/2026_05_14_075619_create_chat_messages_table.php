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
    Schema::create('chat_messages', function (Blueprint $table) {
        $table->id();

        // which conversation this message belongs to
        $table->foreignId('conversation_id')
              ->constrained('chat_conversations')
              ->onDelete('cascade');

        // who sent the message (user or admin)
        $table->foreignId('sender_id')
              ->constrained('users')
              ->onDelete('cascade');

        // message content
        $table->text('message');

        // read status (useful for admin dashboard)
        $table->boolean('is_read')->default(false);

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
