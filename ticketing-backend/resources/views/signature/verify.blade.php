<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Signature Verification - PT. Infrastruktur Bisnis Sejahtera</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f1f5f9;
            color: #0f172a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 14px;
            line-height: 1.5;
        }

        .card {
            width: 100%;
            max-width: 480px;
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }

        .header {
            background-color: #4f6272;
            color: #ffffff;
            padding: 18px 22px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header-logo {
            width: 36px;
            height: 36px;
            background: #ffffff;
            border-radius: 6px;
            padding: 4px;
            object-fit: contain;
            flex-shrink: 0;
        }

        .header-title {
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }

        .header-sub {
            font-size: 12px;
            color: #e2e8f0;
        }

        .body {
            padding: 22px;
        }

        .status-banner {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .status-valid {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #065f46;
        }

        .status-invalid {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
        }

        .status-icon {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 700;
            flex-shrink: 0;
        }

        .status-valid .status-icon {
            background-color: #10b981;
            color: #ffffff;
        }

        .status-invalid .status-icon {
            background-color: #ef4444;
            color: #ffffff;
        }

        .status-heading {
            font-size: 15px;
            font-weight: 700;
        }

        .status-desc {
            font-size: 12.5px;
            opacity: 0.9;
        }

        .section-title {
            font-size: 11.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
            margin: 18px 0 8px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
        }

        .section-title:first-of-type {
            margin-top: 0;
        }

        .info-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-size: 13.5px;
        }

        .info-label {
            color: #64748b;
            flex-shrink: 0;
        }

        .info-value {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
            word-break: break-word;
        }

        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 12px 22px;
            text-align: center;
            font-size: 11.5px;
            color: #64748b;
        }
    </style>
</head>

<body>
    <div class="card">
        <div class="header">
            @if(!empty($logoBase64))
            <img src="{{ $logoBase64 }}" alt="IBS Logo" class="header-logo">
            @endif
            <div>
                <div class="header-title">PT. Infrastruktur Bisnis Sejahtera</div>
                <div class="header-sub">Digital Signature Verification</div>
            </div>
        </div>

        <div class="body">
            @if($isValid)
            <div class="status-banner status-valid">
                <div class="status-icon">&#10003;</div>
                <div>
                    <div class="status-heading">Signature Verified</div>
                </div>
            </div>

            <div class="section-title">Signer Information</div>
            <div class="info-list">
                <div class="info-row">
                    <span class="info-label">Full Name</span>
                    <span class="info-value">{{ $signer['name'] ?: '-' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Employee ID (NIK)</span>
                    <span class="info-value">{{ $signer['nik'] ?: '-' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Position</span>
                    <span class="info-value">{{ $signer['position'] ?: '-' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Division</span>
                    <span class="info-value">{{ $signer['division'] ?: '-' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Department</span>
                    <span class="info-value">{{ $signer['department'] ?: '-' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ $signer['email'] ?: '-' }}</span>
                </div>
            </div>

            <div class="section-title">Approval Details</div>
            <div class="info-list">
                <div class="info-row">
                    <span class="info-label">Ticket Number</span>
                    <span class="info-value">{{ $document['number'] }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Form Type</span>
                    <span class="info-value">{{ $document['form_type'] }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Signed At</span>
                    <span class="info-value">{{ $document['signed_at'] }}</span>
                </div>
            </div>
            @else
            <div class="status-banner status-invalid">
                <div class="status-icon">&#10005;</div>
                <div>
                    <div class="status-heading">Verification Failed</div>
                    <div class="status-desc">{{ $errorMessage ?? 'Invalid digital signature.' }}</div>
                </div>
            </div>
            @endif
        </div>

        <div class="footer">
            Helpdesk System &bull; PT. Infrastruktur Bisnis Sejahtera
        </div>
    </div>
</body>

</html>