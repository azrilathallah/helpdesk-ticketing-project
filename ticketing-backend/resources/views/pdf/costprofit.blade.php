<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>SAP Cost & Profit Center Request - {{ $submission->number ?? '-' }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 18px 20px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 8px;
            color: #0f172a;
            margin: 0;
            padding: 0;
            line-height: 1.25;
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
            padding: 10px 12px;
        }

        .title-row {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }

        .doc-title {
            font-size: 10px;
            font-weight: bold;
            color: #0f172a;
        }

        .no-form-box {
            text-align: right;
            font-size: 8.5px;
            color: #1e293b;
        }

        /* Cost Center & Profit Center Combined Table */
        .cp-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        .cp-group-cost {
            background-color: #000000;
            color: #ffffff;
            font-weight: bold;
            font-size: 8.5px;
            text-align: center;
            padding: 4px;
            border: 1px solid #1e293b;
        }

        .cp-group-profit {
            background-color: #1e4e79;
            color: #ffffff;
            font-weight: bold;
            font-size: 8.5px;
            text-align: center;
            padding: 4px;
            border: 1px solid #1e293b;
        }

        .cp-group-date {
            background-color: #f8fafc;
            color: #0f172a;
            border: 1px solid #334155;
        }

        .cp-col-hdr th {
            border: 1px solid #334155;
            background-color: #f1f5f9;
            padding: 4px 3px;
            font-size: 7.5px;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            color: #0f172a;
        }

        .cp-data-row td {
            border: 1px solid #475569;
            padding: 5px 4px;
            font-size: 7.5px;
            vertical-align: middle;
            color: #0f172a;
            word-wrap: break-word;
        }

        /* Approval Table matching GL style */
        .approval-table {
            width: 65%;
            border-collapse: collapse;
            border: 1px solid #334155;
            margin-top: 12px;
        }

        .approval-table th {
            background-color: #f8fafc;
            border: 1px solid #334155;
            padding: 4px 6px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            color: #0f172a;
            width: 33.33%;
        }

        .meta-cell {
            border: 1px solid #334155;
            padding: 4px 6px;
            font-size: 7.8px;
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
                <td class="doc-title">REQUEST COST &amp; PROFIT CENTER</td>
                <td class="no-form-box">
                    No. Form : <strong>{{ $submission->number ?? '-' }}</strong>
                </td>
            </tr>
        </table>

        @php
            $costRows = is_array($form['cost'] ?? null) ? array_values($form['cost']) : [];
            $profitRows = is_array($form['profit'] ?? null) ? array_values($form['profit']) : [];
            $maxRows = max(1, count($costRows), count($profitRows));
        @endphp

        <table class="cp-table">
            <thead>
                <tr>
                    <th colspan="8" class="cp-group-cost">COST CENTER</th>
                    <th colspan="5" class="cp-group-profit">PROFIT CENTER</th>
                    <th class="cp-group-date"></th>
                </tr>
                <tr class="cp-col-hdr">
                    <th style="width: 7%;">Cost Center</th>
                    <th style="width: 9%;">Short Text</th>
                    <th style="width: 14%;">Long Text</th>
                    <th style="width: 7%;">Person<br>Responsible</th>
                    <th style="width: 5.5%;">Cost<br>Center<br>Category</th>
                    <th style="width: 7%;">Hierarchy Area<br>Cost Center</th>
                    <th style="width: 4.5%;">Company<br>Code</th>
                    <th style="width: 4.5%;">Business<br>Area</th>
                    <th style="width: 7%;">Profit<br>Center</th>
                    <th style="width: 9%;">Short Text</th>
                    <th style="width: 13%;">Long Text</th>
                    <th style="width: 6.5%;">Person<br>Responsible</th>
                    <th style="width: 6%;">Hierarchy Area<br>Profit Center</th>
                    <th style="width: 6%;">Tgl request</th>
                </tr>
            </thead>
            <tbody>
                @for($i = 0; $i < $maxRows; $i++)
                    @php
                        $c = $costRows[$i] ?? [];
                        $p = $profitRows[$i] ?? [];
                    @endphp
                    <tr class="cp-data-row">
                        <td>{{ $c['costCenter'] ?? '' }}</td>
                        <td>{{ $c['shortTextCost'] ?? ($c['shortText'] ?? '') }}</td>
                        <td>{{ $c['longTextCost'] ?? ($c['longText'] ?? '') }}</td>
                        <td>{{ $c['personResponsibleCost'] ?? '' }}</td>
                        <td style="text-align: center;">{{ $c['costCenterCategory'] ?? '' }}</td>
                        <td>{{ $c['hierarchyAreaCostCenter'] ?? '' }}</td>
                        <td style="text-align: center;">{{ $c['companyCode'] ?? '' }}</td>
                        <td style="text-align: center;">{{ $c['businessArea'] ?? '' }}</td>
                        <td>{{ $p['profitCenter'] ?? '' }}</td>
                        <td>{{ $p['shortTextProfit'] ?? ($p['shortText'] ?? '') }}</td>
                        <td>{{ $p['longTextProfit'] ?? ($p['longText'] ?? '') }}</td>
                        <td>{{ $p['personResponsibleProfit'] ?? '' }}</td>
                        <td>{{ $p['hierarchyAreaProfitCenter'] ?? ($p['hierarchyAreaCostCenter'] ?? '') }}</td>
                        <td style="text-align: center;">{{ $requestDateFormatted }}</td>
                    </tr>
                @endfor
            </tbody>
        </table>

        <!-- APPROVAL TABLE -->
        <table class="approval-table">
            <thead>
                <tr>
                    <th>Prepared by</th>
                    <th>Acknowledged by<br>Div. Head Requestor</th>
                    <th>Processed by<br>IT - SAP</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="meta-cell">
                        <strong>Name :</strong> {{ $approvals['requestor']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['requestor']['date'] ?: '-' }}
                    </td>
                    <td class="meta-cell">
                        <strong>Name :</strong> {{ $approvals['div_head']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['div_head']['date'] ?: '-' }}
                    </td>
                    <td class="meta-cell">
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
