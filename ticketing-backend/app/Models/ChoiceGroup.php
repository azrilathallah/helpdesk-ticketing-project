<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChoiceGroup extends Model
{
    protected $fillable = [
        'key',
        'label',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }

    public function options(): HasMany
    {
        return $this->hasMany(ChoiceOption::class)
            ->orderBy('sort_order')
            ->orderBy('id');
    }
}
