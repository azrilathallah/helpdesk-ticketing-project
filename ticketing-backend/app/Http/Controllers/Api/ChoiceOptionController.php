<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChoiceGroup;
use Illuminate\Http\JsonResponse;

class ChoiceOptionController extends Controller
{
    /**
     * GET /choice-options/{key}
     *
     * Hanya menampilkan pilihan yang tanggal hari ini
     * berada di antara start_date dan end_date.
     */
    public function index(string $key): JsonResponse
    {
        $today = now()->toDateString();

        $group = ChoiceGroup::query()
            ->where('key', $key)
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->first();

        if (!$group) {
            return response()->json([
                'data' => [],
            ]);
        }

        $options = $group->options()
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderBy('sort_order')
            ->get([
                'id',
                'value',
                'label',
                'sort_order',
                'start_date',
                'end_date',
            ])
            ->map(fn($option) => [
                'id' => $option->id,
                'value' => $option->value,
                'label' => $option->label,
                'sort_order' => $option->sort_order,
                'start_date' => $option->start_date?->toDateString(),
                'end_date' => $option->end_date?->toDateString(),
            ])
            ->values();

        return response()->json([
            'data' => $options,
        ]);
    }
}
