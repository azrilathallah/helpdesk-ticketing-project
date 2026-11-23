<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>SAP Material Request - {{ $submission->number ?? '-' }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12px 16px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 7.3px;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.12;
        }

        .outer-frame {
            border: 1.5px solid #334155;
        }

        .company-banner {
            background-color: #4f6272;
            color: #ffffff;
            padding: 4px 10px;
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
            width: 18px;
            height: 18px;
            display: block;
        }

        .company-name {
            font-size: 10.5px;
            font-weight: bold;
            color: #ffffff;
            vertical-align: middle;
            letter-spacing: 0.3px;
        }

        .top-area {
            padding: 3px 8px 4px 8px;
            border-bottom: 1px solid #334155;
        }

        .no-form-row {
            text-align: right;
            font-size: 7.8px;
            margin-bottom: 3px;
            color: #1e293b;
        }

        .no-form-line {
            display: inline-block;
            min-width: 170px;
            border-bottom: 1px dotted #475569;
            text-align: left;
            padding: 0 4px 1px 4px;
            font-weight: bold;
            color: #0f172a;
        }

        .banner-table {
            width: 100%;
            border-collapse: collapse;
        }

        .title-banner {
            background-color: #4f6272;
            color: #ffffff;
            font-size: 10.5px;
            font-weight: bold;
            padding: 4.5px 10px;
            border: 1px solid #334155;
            width: 225px;
            text-align: center;
        }

        .request-type-strip {
            padding: 3px 8px 4px 8px;
        }

        .strip-table {
            width: 100%;
            border-collapse: collapse;
        }

        .strip-table td {
            padding: 1px 2px;
            vertical-align: middle;
        }

        .section-bar {
            background-color: #4f6272;
            color: #ffffff;
            font-weight: bold;
            font-size: 7.8px;
            padding: 2px 7px;
            border-top: 1px solid #334155;
            border-bottom: 1px solid #334155;
        }

        .section-content {
            padding: 2.5px 6px 3px 6px;
        }

        .rows-table {
            width: 100%;
            border-collapse: collapse;
        }

        .rows-table td {
            padding: 1px 2px;
            vertical-align: middle;
        }

        .c-no {
            width: 15px;
            color: #1e293b;
        }

        .c-lbl {
            width: 138px;
            color: #1e293b;
        }

        .c-val {
            vertical-align: middle;
        }

        .field-box {
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            padding: 1.5px 5px;
            min-height: 11px;
            color: #0f172a;
            font-size: 7.3px;
            word-wrap: break-word;
        }

        .field-box-bold {
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            padding: 1.5px 5px;
            min-height: 11px;
            color: #0f172a;
            font-size: 7.3px;
            font-weight: bold;
        }

        .v-box {
            display: inline-block;
            width: 11px;
            height: 9.5px;
            line-height: 8px;
            text-align: center;
            border: 0.7px solid #64748b;
            background-color: #ffffff;
            font-family: "DejaVu Sans", sans-serif;
            font-weight: bold;
            font-size: 7.2px;
            color: #0f172a;
            vertical-align: middle;
            margin-right: 2px;
        }

        .v-lbl {
            vertical-align: middle;
            font-size: 6.9px;
            color: #1e293b;
        }

        .opt-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .opt-grid td {
            padding: 0.7px 3px 0.7px 0;
            vertical-align: middle;
        }

        /* Approval Table */
        .approval-table {
            width: 100%;
            border-collapse: collapse;
            border-top: 1.2px solid #334155;
        }

        .approval-table th {
            background-color: #f8fafc;
            border-bottom: 0.9px solid #334155;
            border-right: 0.9px solid #334155;
            padding: 3px 3px;
            font-size: 7.3px;
            font-weight: bold;
            text-align: center;
            color: #1e293b;
            width: 25%;
        }

        .approval-table th:last-child,
        .approval-table td:last-child {
            border-right: none;
        }

        .sign-area {
            height: 40px;
            border-bottom: 0.9px solid #334155;
            border-right: 0.9px solid #334155;
            padding: 2px 4px;
            text-align: center;
            vertical-align: middle;
        }

        .sign-stamp {
            font-weight: bold;
            font-size: 7.5px;
            color: #166534;
            margin-bottom: 1.5px;
        }

        .sign-meta {
            font-size: 6.6px;
            color: #475569;
            line-height: 1.12;
            word-wrap: break-word;
        }

        .name-row-cell {
            border-bottom: 0.9px solid #334155;
            border-right: 0.9px solid #334155;
            padding: 2px 4px;
            font-size: 7px;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
        }

        .date-row-cell {
            border-right: 0.9px solid #334155;
            padding: 2px 4px;
            font-size: 7px;
            color: #0f172a;
        }

        .date-line-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-cell {
            border-right: 0.9px solid #334155;
            padding: 3.5px 5px;
            font-size: 7.2px;
            color: #0f172a;
            line-height: 1.3;
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

    <!-- TOP HEADER: No. Form & Form Material Master Title Box -->
    <div class="top-area">
        <div class="no-form-row">
            No. Form : <strong>{{ $submission->number ?? '-' }}</strong>
        </div>
        <table class="banner-table">
            <tr>
                <td class="title-banner">Form Material Master</td>
                <td></td>
            </tr>
        </table>
    </div>

    <!-- TOP STRIP: Request Type & Material Code -->
    <div class="request-type-strip">
        <table class="strip-table">
            <tr>
                @foreach($choiceGroups['material_request_type'] ?? [] as $opt)
                <td style="width: 18%;">
                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                    <span class="v-lbl">
                        {{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif
                    </span>
                </td>
                @endforeach
                <td></td>
            </tr>
        </table>
        <table class="strip-table" style="margin-top: 2px;">
            <tr>
                <td style="width: 85px; font-weight: bold;">Material Code</td>
                <td style="width: 145px;">
                    <div class="field-box-bold">{{ $form['materialCode'] ?? '' }}</div>
                </td>
                <td></td>
            </tr>
        </table>
    </div>

    <!-- SECTION: INITIAL SCREEN -->
    <div class="section-bar">Initial Screen</div>
    <div class="section-content">
        <table class="rows-table">
            <!-- 1. Industry sector -->
            <tr>
                <td class="c-no">1.</td>
                <td class="c-lbl">Industry Sector</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['material_industry_sector'] ?? [] as $opt)
                            <td>
                                <span class="v-box">{{ $opt['checked'] ? $opt['value'] : '' }}</span>
                                <span class="v-lbl">{{ $opt['label'] && $opt['label'] !== $opt['value'] ? $opt['label'] : $opt['value'] }}</span>
                            </td>
                            @endforeach
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- 2. Material Type -->
            <tr>
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">2.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Material Type</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['material_type'] ?? [], 4) as $chunk)
                        <tr>
                            @foreach($chunk as $opt)
                            <td style="width: 25%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            @for($i = count($chunk); $i < 4; $i++)
                            <td style="width: 25%;"></td>
                            @endfor
                        </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
            <!-- 3. Plant -->
            <tr>
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">3.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Plant</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['material_plant'] ?? [], 5) as $chunk)
                        <tr>
                            @foreach($chunk as $opt)
                            <td style="width: 20%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            @for($i = count($chunk); $i < 5; $i++)
                            <td style="width: 20%;"></td>
                            @endfor
                        </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
            <!-- 4. Sales Organization -->
            <tr>
                <td class="c-no">4.</td>
                <td class="c-lbl">Sales Organization</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['material_sales_organization'] ?? [] as $opt)
                            <td style="width: 33.33%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- 5. Distribution Channel -->
            <tr>
                <td class="c-no">5.</td>
                <td class="c-lbl">Distribution Channel</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['material_distribution_channel'] ?? [] as $opt)
                            <td style="width: 33.33%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- 6. Storage Location -->
            <tr>
                <td class="c-no">6.</td>
                <td class="c-lbl">Storage Location</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 34%; padding: 0;"><div class="field-box">{{ $form['storageLocation'] ?? '' }}</div></td>
                            <td style="width: 66%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- 7. Kode SPMS -->
            <tr>
                <td class="c-no">7.</td>
                <td class="c-lbl">Kode SPMS</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 34%; padding: 0;"><div class="field-box">{{ $form['kodeSPMS'] ?? '' }}</div></td>
                            <td style="width: 66%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- SECTION: BASIC DATA -->
    <div class="section-bar">Basic Data</div>
    <div class="section-content">
        <table class="rows-table">
            <tr>
                <td class="c-no">1.</td>
                <td class="c-lbl">Description</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 90%; padding: 0;"><div class="field-box">{{ $form['description'] ?? '' }}</div></td>
                            <td style="width: 10%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">2.</td>
                <td class="c-lbl">Base Unit of Measure</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 34%; padding: 0;"><div class="field-box">{{ $form['baseUnitofMeasure'] ?? '' }}</div></td>
                            <td style="width: 66%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">3.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Material Group</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['material_group'] ?? [], 3) as $chunk)
                        <tr>
                            @foreach($chunk as $opt)
                            <td style="width: 33.33%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            @for($i = count($chunk); $i < 3; $i++)
                            <td style="width: 33.33%;"></td>
                            @endfor
                        </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- SECTION: SALES VIEW -->
    <div class="section-bar">Sales View</div>
    <div class="section-content">
        <table class="rows-table">
            <tr>
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">1.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Division</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['material_division'] ?? [], 3) as $chunk)
                        <tr>
                            @foreach($chunk as $opt)
                            <td style="width: 33.33%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            @for($i = count($chunk); $i < 3; $i++)
                            <td style="width: 33.33%;"></td>
                            @endfor
                        </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">2.</td>
                <td class="c-lbl">GenItemCatGroup</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['material_genitemcatgroup'] ?? [] as $opt)
                            <td style="width: 33.33%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">3.</td>
                <td class="c-lbl">Tax</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['material_tax'] ?? [] as $opt)
                            <td style="width: 33.33%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">4.</td>
                <td class="c-lbl">Matl. Statis Group</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['material_matl_statis_group'] ?? [] as $opt)
                            <td style="width: 33.33%;">
                                <span class="v-box">{{ $opt['checked'] ? $opt['value'] : '' }}</span>
                                <span class="v-lbl">{{ $opt['label'] && $opt['label'] !== $opt['value'] ? $opt['label'] : $opt['value'] }}</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">5.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Acct. Assignement Group</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['material_acc_assignement_group'] ?? [], 3) as $chunk)
                        <tr>
                            @foreach($chunk as $opt)
                            <td style="width: 33.33%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            @for($i = count($chunk); $i < 3; $i++)
                            <td style="width: 33.33%;"></td>
                            @endfor
                        </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">6.</td>
                <td class="c-lbl">Recon Account</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['reconAccount'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- SECTION: ACCOUNTING DATA 1 -->
    <div class="section-bar">Accounting Data 1</div>
    <div class="section-content">
        <table class="rows-table">
            <tr>
                <td class="c-no">1.</td>
                <td class="c-lbl">GL Account</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['glAccount'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- FOOTER APPROVAL TABLE -->
    <table class="approval-table">
        <thead>
            <tr>
                <th>Requested by</th>
                <th>Approved by<br>Div. Head Requestor</th>
                <th>Approved by<br>Accounting Div. Head</th>
                <th>Accepted by<br>IT-SAP</th>
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
                    <strong>Name :</strong> {{ $approvals['accounting']['name'] ?: '-' }}<br>
                    <strong>Date :</strong> {{ $approvals['accounting']['date'] ?: '-' }}
                </td>
                <td class="meta-cell">
                    <strong>Name :</strong> {{ $approvals['pic']['name'] ?: '-' }}<br>
                    <strong>Date :</strong> {{ $approvals['pic']['date'] ?: '-' }}
                </td>
            </tr>
        </tbody>
    </table>
</div>
</body>
</html>
