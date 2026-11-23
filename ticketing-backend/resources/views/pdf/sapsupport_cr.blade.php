<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>SAP Change Request Form - {{ $submission->number ?? '-' }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 18px 22px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 9px;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.3;
        }

        .outer-frame {
            border: 1.5px solid #334155;
            padding-bottom: 14px;
        }

        .company-banner {
            background-color: #4f6272;
            color: #ffffff;
            padding: 5px 10px;
            border-bottom: 1px solid #334155;
        }

        .main-box {
            border: 1.2px solid #1e293b;
        }

        .company-header {
            width: 100%;
            border-collapse: collapse;
        }

        .company-header td {
            vertical-align: middle;
            padding: 0;
        }

        .company-logo-wrap {
            display: inline-block;
            background-color: #ffffff;
            padding: 2px;
            border-radius: 3px;
            vertical-align: middle;
            margin-right: 7px;
        }

        .company-logo {
            width: 20px;
            height: 20px;
            display: block;
        }

        .company-name {
            font-size: 11px;
            font-weight: bold;
            color: #ffffff;
            vertical-align: middle;
            letter-spacing: 0.3px;
        }

        .content-body {
            padding: 10px 14px;
        }

        .title-row {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        .doc-title {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.3px;
        }

        .no-form-box {
            text-align: right;
            font-size: 8.5px;
            color: #1e293b;
        }

        /* Top Meta Grid Table */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .meta-table td {
            border: 1px solid #334155;
            padding: 5px 7px;
            font-size: 8.8px;
            vertical-align: middle;
            color: #0f172a;
        }

        .meta-label {
            font-weight: bold;
            background-color: #f8fafc;
            width: 22%;
        }

        .meta-val {
            width: 28%;
        }

        /* Main Framed Content Box */

        .box-section {
            border-bottom: 1px solid #1e293b;
            padding: 7px 9px;
        }

        .box-heading {
            font-size: 9.2px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 4px;
        }

        .box-heading-underline {
            font-size: 9.2px;
            font-weight: bold;
            text-decoration: underline;
            color: #0f172a;
            margin-bottom: 2px;
        }

        .box-subtext {
            font-size: 7.8px;
            font-style: italic;
            color: #475569;
            margin-bottom: 6px;
        }

        .box-text-content {
            min-height: 75px;
            font-size: 8.8px;
            color: #0f172a;
            white-space: pre-wrap;
            word-wrap: break-word;
            padding: 2px 0;
        }

        .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
        }

        .info-grid td {
            padding: 3px 4px;
            vertical-align: top;
        }

        .v-box {
            display: inline-block;
            width: 12px;
            height: 11px;
            line-height: 9.5px;
            text-align: center;
            border: 0.9px solid #334155;
            background-color: #ffffff;
            font-family: "DejaVu Sans", sans-serif;
            font-weight: bold;
            font-size: 8.2px;
            color: #0f172a;
            vertical-align: middle;
            margin-right: 4px;
        }

        .v-lbl {
            vertical-align: middle;
            font-size: 8.8px;
            font-weight: bold;
            color: #0f172a;
        }

        /* Approval Table inside the bottom of Main Box */
        .cr-approval-table {
            width: 100%;
            border-collapse: collapse;
        }

        .cr-approval-table th {
            border-bottom: 1px solid #1e293b;
            border-right: 1px solid #1e293b;
            background-color: #f8fafc;
            padding: 4px 6px;
            font-size: 8.5px;
            font-weight: bold;
            text-align: center;
            color: #0f172a;
            width: 33.33%;
        }

        .cr-approval-table th:last-child,
        .cr-approval-table td:last-child {
            border-right: none;
        }

        .cr-meta-cell {
            border-right: 1px solid #1e293b;
            padding: 5px 7px;
            font-size: 8.3px;
            color: #0f172a;
            line-height: 1.35;
        }
    </style>
</head>
<body>
<div class="outer-frame">
    <!-- FULL-WIDTH COMPANY HEADER -->
    <div class="company-banner">
        <table class="company-header">
            <tr>
                <td>
                    @if(!empty($logoBase64))
                    <span class="company-logo-wrap">
                        <img src="{{ $logoBase64 }}" alt="IBS Logo" class="company-logo">
                    </span>
                    @endif
                    <span class="company-name">PT. Infrastruktur Bisnis Sejahtera</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="content-body">
        <table class="title-row">
            <tr>
                <td class="doc-title">FORMULIR CHANGE REQUEST MANAGEMENT</td>
                <td class="no-form-box">
                    No. Ticket : <strong>{{ $submission->number ?? '-' }}</strong>
                </td>
            </tr>
        </table>

        <!-- TOP METADATA TABLE -->
        <table class="meta-table">
            <tr>
                <td class="meta-label">Judul Permintaan :</td>
                <td colspan="3">{{ ($cr['title'] ?? '') ?: '-' }}</td>
            </tr>
            <tr>
                <td class="meta-label">Diminta Oleh :</td>
                <td class="meta-val">{{ $requestor['name'] ?: '-' }}</td>
                <td class="meta-label">Department/Unit :</td>
                <td class="meta-val">{{ $requestor['department'] ?: '-' }}</td>
            </tr>
            <tr>
                <td class="meta-label">Tanggal Permintaan :</td>
                <td class="meta-val">{{ $requestDateFormatted ?: '-' }}</td>
                <td class="meta-label">Tanggal Target Permintaan :</td>
                <td class="meta-val">{{ $targetDateFormatted ?: '-' }}</td>
            </tr>
            <tr>
                <td class="meta-label">No. Change Request :</td>
                <td class="meta-val">{{ ($cr['crNumber'] ?? '') ?: '-' }}</td>
                <td class="meta-label">SAP Functional :</td>
                <td class="meta-val">{{ ($cr['sapFunctional'] ?? '') ?: '-' }}</td>
            </tr>
        </table>

        <!-- MAIN CONTENT BOX -->
        <div class="main-box">
            <!-- Informasi Permintaan -->
            <div class="box-section">
                <div class="box-heading">Informasi Permintaan</div>
                <table class="info-grid">
                    <tr>
                        <td style="width: 14%; font-weight: bold;">Implikasi:</td>
                        @foreach($choiceGroups['sap-support_implication'] ?? [] as $opt)
                            <td style="width: 28%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}</span>
                            </td>
                        @endforeach
                        <td></td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Prioritas:</td>
                        @foreach($choiceGroups['sap-support_priority'] ?? [] as $opt)
                            <td style="width: 28%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}</span>
                            </td>
                        @endforeach
                    </tr>
                </table>
            </div>

            <!-- Penjelasan Bisnis Proses yang sedang berjalan pada saat ini -->
            <div class="box-section">
                <div class="box-heading-underline">Penjelasan Bisnis Proses yang sedang berjalan pada saat ini</div>
                <div class="box-subtext">Jelaskan mengenai proses yang berjalan saat ini atau skenario yang ingin diubah.</div>
                <div class="box-text-content">{{ ($cr['currentProcess'] ?? '') ?: '-' }}</div>
            </div>

            <!-- Penjelasan Bisnis Proses yang diharapkan -->
            <div class="box-section">
                <div class="box-heading-underline">Penjelasan Bisnis Proses yang diharapkan</div>
                <div class="box-subtext">Apa persyaratan bisnis yang kurang, yang perlu dimasukkan sebagai bagian dari desain. Persyaratan dapat dikaitkan dengan proses, interface, konversi data, report atau form-form.</div>
                <div class="box-text-content">{{ ($cr['expectedProcess'] ?? '') ?: '-' }}</div>
            </div>

            <!-- Keuntungan/Kelebihan perubahan Bisnis Proses -->
            <div class="box-section">
                <div class="box-heading-underline">Keuntungan/Kelebihan perubahan Bisnis Proses</div>
                <div class="box-subtext">Jelaskan alasan bisnis mengapa hal ini diperlukan.</div>
                <div class="box-text-content">{{ ($cr['benefit'] ?? '') ?: '-' }}</div>
            </div>

            <!-- Approval Table (Requester, Ka. Div Requester Approval, SAP Team Lead / SAP Div Head) -->
            <table class="cr-approval-table">
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Div. Head Requester</th>
                        <th>IT-SAP Div. Head</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="cr-meta-cell">
                            <strong>Name :</strong> {{ $approvals['cr_requestor']['name'] ?: ($requestor['name'] ?: '-') }}<br>
                            <strong>Date :</strong> {{ $approvals['cr_requestor']['date'] ?: '-' }}
                        </td>
                        <td class="cr-meta-cell">
                            <strong>Name :</strong> {{ $approvals['div_head']['name'] ?: '-' }}<br>
                            <strong>Date :</strong> {{ $approvals['div_head']['date'] ?: '-' }}
                        </td>
                        <td class="cr-meta-cell">
                            <strong>Name :</strong> {{ $approvals['it_sap_head']['name'] ?: '-' }}<br>
                            <strong>Date :</strong> {{ $approvals['it_sap_head']['date'] ?: '-' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</body>
</html>
