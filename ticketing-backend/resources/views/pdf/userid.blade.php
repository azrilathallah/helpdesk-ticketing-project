<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>SAP User ID Request - {{ $submission->number ?? '-' }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 16px 22px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 8.8px;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.3;
        }

        .outer-frame {
            border: 1.5px solid #334155;
            padding-bottom: 12px;
        }

        .company-banner {
            background-color: #4f6272;
            color: #ffffff;
            padding: 5px 10px;
            border-bottom: 1px solid #334155;
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
            padding: 10px 16px;
        }

        .no-form-row {
            text-align: right;
            font-size: 8.5px;
            color: #1e293b;
            margin-bottom: 4px;
        }

        .doc-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 6px 0 12px 0;
            color: #0f172a;
            letter-spacing: 0.5px;
        }

        .roman-heading {
            font-size: 10px;
            font-weight: bold;
            text-decoration: underline;
            margin: 10px 0 6px 0;
            color: #0f172a;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-left: 8px;
        }

        .info-table td {
            padding: 2.5px 3px;
            vertical-align: middle;
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
            font-size: 8.5px;
            font-weight: bold;
            color: #1e293b;
            margin-right: 18px;
        }

        .sap-id-line {
            display: inline-block;
            min-width: 150px;
            border-bottom: 1px solid #334155;
            padding: 0 6px;
            font-weight: bold;
            color: #0f172a;
        }

        .purpose-box {
            border: 1px solid #334155;
            min-height: 44px;
            padding: 6px 8px;
            margin: 3px 0 6px 22px;
            font-weight: bold;
            color: #0f172a;
            background-color: #ffffff;
        }

        /* III. Notes Table */
        .notes-table {
            width: 97%;
            margin: 4px 0 12px 14px;
            border-collapse: collapse;
        }

        .notes-table th {
            border: 1px solid #334155;
            background-color: #f8fafc;
            padding: 4px 5px;
            font-size: 8.2px;
            font-weight: bold;
            text-align: center;
            color: #0f172a;
        }

        .notes-table th .th-sub {
            font-size: 7px;
            font-weight: normal;
            display: block;
            color: #334155;
        }

        .notes-table td {
            border: 1px solid #334155;
            padding: 5px 6px;
            font-size: 8.2px;
            vertical-align: top;
            height: 46px;
            color: #0f172a;
        }

        /* Approval Table matching SAP USER-ID REQUEST */
        .approval-table {
            width: 97%;
            margin: 10px 0 0 14px;
            border-collapse: collapse;
            border: 1px solid #334155;
        }

        .approval-table th {
            border: 1px solid #334155;
            background-color: #f8fafc;
            padding: 4px 6px;
            font-size: 8.5px;
            font-weight: bold;
            text-align: center;
            color: #0f172a;
        }

        .sign-cell {
            height: 56px;
            border: 1px solid #334155;
            padding: 4px 6px;
            text-align: center;
            vertical-align: middle;
            width: 33.33%;
        }

        .sign-stamp {
            font-weight: bold;
            font-size: 8.5px;
            color: #166534;
            margin-bottom: 2px;
        }

        .sign-meta {
            font-size: 7.3px;
            color: #475569;
            line-height: 1.2;
        }

        .name-cell {
            border: 1px solid #334155;
            padding: 3.5px 6px;
            font-size: 8px;
            color: #0f172a;
            line-height: 1.25;
        }

        .date-cell {
            border: 1px solid #334155;
            padding: 3.5px 6px;
            font-size: 8px;
            color: #0f172a;
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
        <div class="no-form-row">
            No. Form : <strong>{{ $submission->number ?? '-' }}</strong>
        </div>

        <div class="doc-title">SAP USER-ID REQUEST</div>

        <!-- I. REQUESTER INFORMATION -->
        <div class="roman-heading">I. Requester Information:</div>
        <table class="info-table">
            <tr>
                <td style="width: 14px;">&bull;</td>
                <td style="width: 115px;">Company</td>
                <td style="width: 10px;">:</td>
                <td colspan="4">
                    @foreach($choiceGroups['user-id_company_code'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['label'] && $opt['label'] !== $opt['value'] ? $opt['label'] . ' ' . $opt['value'] : $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td>&bull;</td>
                <td>Name of Requester</td>
                <td>:</td>
                <td style="width: 215px;">{{ $requestor['name'] ?: '-' }}</td>
                <td style="width: 55px;">NIK</td>
                <td style="width: 10px;">:</td>
                <td>{{ $requestor['nik'] ?: '-' }}</td>
            </tr>
            <tr>
                <td>&bull;</td>
                <td>Position</td>
                <td>:</td>
                <td>{{ $requestor['position'] ?: '-' }}</td>
                <td>Dept.</td>
                <td>:</td>
                <td>{{ $requestor['department'] ?: '-' }}</td>
            </tr>
            <tr>
                <td>&bull;</td>
                <td>Email Address</td>
                <td>:</td>
                <td>{{ $requestor['email'] ?: '-' }}</td>
                <td>Phone</td>
                <td>:</td>
                <td>{{ ($form['phone'] ?? '') ?: ($requestor['telephone'] ?: '-') }}</td>
            </tr>
            <tr>
                <td></td>
                <td>Request for SAP-ID</td>
                <td>:</td>
                <td colspan="4">
                    @foreach($choiceGroups['user-id_request_type'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                    <span style="margin-left: 10px;">SAP ID: <span class="sap-id-line">{{ ($form['userIdCode'] ?? '') ?: '-' }}</span></span>
                </td>
            </tr>
        </table>

        <div style="margin: 4px 0 2px 22px;">Purpose of Use:</div>
        <div class="purpose-box">{{ ($form['purposeOfUse'] ?? '') ?: '-' }}</div>

        <!-- II. SAP USER INFORMATION -->
        <div class="roman-heading">II. SAP User Information:</div>
        <table class="info-table" style="margin-left: 22px;">
            <tr>
                <td style="width: 125px;">Access to SAP Server</td>
                <td style="width: 10px;">:</td>
                <td>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            @foreach($choiceGroups['user-id_access_sap_server'] ?? [] as $opt)
                                <td style="width: 33.33%; padding: 1px 0;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}</span>
                                </td>
                            @endforeach
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>Priority</td>
                <td>:</td>
                <td>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            @foreach($choiceGroups['user-id_priority'] ?? [] as $opt)
                                <td style="width: 33.33%; padding: 1px 0;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}</span>
                                </td>
                            @endforeach
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="vertical-align: top; padding-top: 3px;">Function Module</td>
                <td style="vertical-align: top; padding-top: 3px;">:</td>
                <td>
                    <table style="width: 100%; border-collapse: collapse;">
                        @foreach(array_chunk($choiceGroups['user-id_funtion_module'] ?? [], 3) as $chunk)
                            <tr>
                                @foreach($chunk as $opt)
                                    <td style="width: 33.33%; padding: 1.5px 0;">
                                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                        <span class="v-lbl">{{ $opt['value'] }}</span>
                                    </td>
                                @endforeach
                            </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
        </table>

        <!-- III. NOTES -->
        <div class="roman-heading">III. Notes:</div>
        @php
            $notesList = is_array($form['notes'] ?? null) && count($form['notes']) > 0
                ? $form['notes']
                : [];
            $noteCount = max(2, count($notesList));
        @endphp
        <table class="notes-table">
            <thead>
                <tr>
                    <th style="width: 7%;">No.</th>
                    <th style="width: 30%;">Request<span class="th-sub">(Filled by User)</span></th>
                    <th style="width: 28%;">Activity &amp; Role to Add<span class="th-sub">(Filled by Basis / Functional)</span></th>
                    <th style="width: 17%;">Other users<br>with this role</th>
                    <th style="width: 18%;">Valid<br>From/To</th>
                </tr>
            </thead>
            <tbody>
                @for($i = 0; $i < $noteCount; $i++)
                    @php
                        $n = $notesList[$i] ?? [];
                    @endphp
                    <tr>
                        <td style="text-align: center;">{{ $i + 1 }}.</td>
                        <td>{{ $n['request'] ?? '' }}</td>
                        <td>{{ $n['activityRole'] ?? '' }}</td>
                        <td>{{ $n['otherUsers'] ?? '' }}</td>
                        <td>
                            <div style="margin-bottom: 10px;">From : {{ $n['validFrom'] ?? '' }}</div>
                            <div>To : {{ $n['validTo'] ?? '' }}</div>
                        </td>
                    </tr>
                @endfor
            </tbody>
        </table>

        <!--  APPROVAL TABLE  -->
        <table class="approval-table">
            <thead>
                <tr>
                    <th>Requested by</th>
                    <th>Approved by<br>Div. Head Requestor</th>
                    <th>Handled by<br>IT - SAP</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="name-cell">
                        <strong>Name :</strong> {{ $approvals['requestor']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['requestor']['date'] ?: '-' }}
                    </td>
                    <td class="name-cell">
                        <strong>Name :</strong> {{ $approvals['div_head']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['div_head']['date'] ?: '-' }}
                    </td>
                    <td class="name-cell">
                        <strong>Name :</strong> {{ $approvals['pic']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['pic']['date'] ?: '-' }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
