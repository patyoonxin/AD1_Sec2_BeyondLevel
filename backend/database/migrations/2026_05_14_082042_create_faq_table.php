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
    Schema::create('faq', function (Blueprint $table) {
        $table->id('faq_id');

        $table->string('question_eng');
        $table->text('answer_eng');

        $table->string('question_malay')->nullable();
        $table->text('answer_malay')->nullable();

        $table->string('keywords')->nullable();
        $table->string('category')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faq');
    }
};
