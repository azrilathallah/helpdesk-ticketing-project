<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{ $subjectLine }}</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:14px;line-height:1.5;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:#f4f6f8;">
        <tr>
            <td align="center" style="padding:24px 12px;">
                <table width="640" cellpadding="0" cellspacing="0" role="presentation" align="center" style="width:100%;max-width:640px;margin:0 auto;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;text-align:left;">
                    <tr>
                        <td style="background-color:#1e3a8a;padding:18px 24px;color:#ffffff;">
                            <div style="font-size:18px;font-weight:bold;letter-spacing:0.04em;">{{ $subjectLine }}</div>
                        </td>
                    </tr>

                    @if($isOverrideActive)
                    <tr>
                        <td style="background-color:#fef3c7;border-bottom:1px solid #fcd34d;padding:12px 24px;color:#92400e;font-size:12px;">
                            <strong>[TEST MODE]</strong> This email was redirected to
                            <strong>{{ implode(', ', $actualRecipients) }}</strong>.<br>
                            <strong>Intended Recipient ({{ $intendedRoleLabel }}):</strong>
                            {{ !empty($intendedRecipients) ? implode(', ', $intendedRecipients) : 'Not found' }}
                        </td>
                    </tr>
                    @endif

                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 12px 0;">Hello {{ $recipientName }},</p>
                            <p style="margin:0 0 18px 0;">{{ $introMessage }}</p>

                            <table width="100%" cellpadding="8" cellspacing="0" role="presentation" style="border-collapse:collapse;border:1px solid #e5e7eb;margin-bottom:18px;">
                                <tr style="background-color:#f9fafb;">
                                    <td style="width:38%;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#374151;">Ticket Number</td>
                                    <td style="border-bottom:1px solid #e5e7eb;">{{ $submission->number }}</td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #e5e7eb;font-weight:bold;color:#374151;">Form Type</td>
                                    <td style="border-bottom:1px solid #e5e7eb;">{{ $submission->form_type }}</td>
                                </tr>
                                <tr style="background-color:#f9fafb;">
                                    <td style="border-bottom:1px solid #e5e7eb;font-weight:bold;color:#374151;">Requestor</td>
                                    <td style="border-bottom:1px solid #e5e7eb;">
                                        {{ $submission->requestor?->name ?? '-' }}
                                        @if($submission->requestor?->nik)
                                        ({{ $submission->requestor->nik }})
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #e5e7eb;font-weight:bold;color:#374151;">Division</td>
                                    <td style="border-bottom:1px solid #e5e7eb;">{{ $submission->requestor?->division ?: '-' }}</td>
                                </tr>
                                <tr style="background-color:#f9fafb;">
                                    <td style="border-bottom:1px solid #e5e7eb;font-weight:bold;color:#374151;">Current Status</td>
                                    <td style="border-bottom:1px solid #e5e7eb;"><strong>{{ $statusLabel }}</strong></td>
                                </tr>
                                @if($notes)
                                <tr>
                                    <td style="font-weight:bold;color:#374151;vertical-align:top;">Notes</td>
                                    <td style="white-space:pre-line;">{{ $notes }}</td>
                                </tr>
                                @endif
                            </table>

                            <p style="margin:0;color:#4b5563;">
                                Please log in to the {{ $appName }} website to view the ticket details and take the necessary action.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:12px 24px;font-size:12px;color:#6b7280;">
                            This email was sent automatically by the {{ $appName }} system. Please do not reply directly to this email.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>