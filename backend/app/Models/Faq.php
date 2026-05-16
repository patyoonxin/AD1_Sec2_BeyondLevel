<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    
    protected $table = 'faq';

    protected $primaryKey = 'faq_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'question_eng',
        'answer_eng',
        'question_malay',
        'answer_malay',
        'keywords',
        'category'
    ];
}
