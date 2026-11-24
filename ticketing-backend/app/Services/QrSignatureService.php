<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\URL;

class QrSignatureService
{
    public function generateForSignature(
        Submission $submission,
        string $role,
        ?SubmissionApproval $approval = null,
        int $size = 360
    ): string {
        return $this->generateDataUri(
            $this->buildVerificationUrl($submission, $role, $approval),
            $size
        );
    }

    private function buildVerificationUrl(
        Submission $submission,
        string $role,
        ?SubmissionApproval $approval = null
    ): string {
        $params = [
            'submission' => $submission->id,
            'role' => $role,
        ];

        if ($approval !== null) {
            $params['approval'] = $approval->id;
        }

        $relativeSignedPath = URL::signedRoute('signature.verify', $params, absolute: false);

        $baseUrl = trim((string) config('app.qr_verify_url', ''));
        if ($baseUrl === '') {
            $baseUrl = request()?->getSchemeAndHttpHost() ?: (string) config('app.url', '');
        }

        return rtrim($baseUrl, '/') . $relativeSignedPath;
    }

    private function generateDataUri(string $url, int $size = 360): string
    {
        $logoPath = public_path('icon/IBS.png');
        $hasLogo = is_file($logoPath);

        $builder = new Builder(
            writer: new PngWriter(),
            validateResult: false,
            data: $url,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: $size,
            margin: 2,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            logoPath: $hasLogo ? $logoPath : '',
            logoResizeToWidth: $hasLogo ? (int) round($size * 0.24) : null,
            logoPunchoutBackground: $hasLogo,
        );

        return $builder->build()->getDataUri();
    }
}
