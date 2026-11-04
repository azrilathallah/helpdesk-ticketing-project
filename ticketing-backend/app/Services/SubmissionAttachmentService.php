<?php

namespace App\Services;

use App\Models\Submission;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubmissionAttachmentService
{
    private const DISK = 'local';

    public static function present(Submission $submission, string $routePrefix): array
    {
        return collect($submission->attachments ?? [])
            ->values()
            ->map(fn(array $file, int $index) => [
                'index' => $index,
                'name' => $file['name'] ?? 'attachment',
                'size' => $file['size'] ?? null,
                'type' => $file['type'] ?? null,
                'url' => "/{$routePrefix}/{$submission->id}/attachments/{$index}",
            ])
            ->all();
    }

    public static function response(Submission $submission, int $index): StreamedResponse
    {
        $files = array_values($submission->attachments ?? []);
        $file = $files[$index] ?? null;

        abort_if(!$file || empty($file['path']), 404, 'Attachment not found.');

       
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(self::DISK);

        abort_unless($disk->exists($file['path']), 404, 'Attachment file is missing.');

        $name = $file['name'] ?? basename($file['path']);

        $type = ($file['type'] ?? null)
            ?: $disk->mimeType($file['path'])
            ?: 'application/octet-stream';

        return $disk->response($file['path'], $name, [
            'Content-Type' => $type,
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ], 'inline');
    }
}

