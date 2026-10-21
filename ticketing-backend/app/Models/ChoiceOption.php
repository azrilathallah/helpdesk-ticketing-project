<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChoiceOption extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'choice_group_id',
        'value',
        'label',
        'sort_order',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'sort_order' => 'integer',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(ChoiceGroup::class, 'choice_group_id');
    }
}
