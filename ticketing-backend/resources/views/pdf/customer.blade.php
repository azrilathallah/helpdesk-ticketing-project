<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>SAP Customer Request - {{ $submission->number ?? '-' }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 14px 18px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 7.8px;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.15;
        }

        .outer-frame {
            border: 1.5px solid #334155;
        }

        /* Top Header Area */
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

        .top-area {
            padding: 4px 8px 6px 8px;
            border-bottom: 1px solid #334155;
        }

        .no-form-row {
            text-align: right;
            font-size: 8.2px;
            margin-bottom: 4px;
            color: #1e293b;
        }

        .banner-table {
            width: 100%;
            border-collapse: collapse;
        }

        .title-banner {
            background-color: #4f6272;
            color: #ffffff;
            font-size: 11.5px;
            font-weight: bold;
            padding: 6px 12px;
            border: 1px solid #334155;
            width: 225px;
            text-align: center;
        }

        /* Request Type & Customer Code Top Strip */
        .request-type-strip {
            padding: 4px 8px 5px 8px;
        }

        .strip-table {
            width: 100%;
            border-collapse: collapse;
        }

        .strip-table td {
            padding: 1.5px 2px;
            vertical-align: middle;
        }

        /* Dark Section Bar */
        .section-bar {
            background-color: #4f6272;
            color: #ffffff;
            font-weight: bold;
            font-size: 8.2px;
            padding: 2.5px 7px;
            border-top: 1px solid #334155;
            border-bottom: 1px solid #334155;
        }

        .section-content {
            padding: 3px 6px 4px 6px;
        }

        .rows-table {
            width: 100%;
            border-collapse: collapse;
        }

        .rows-table td {
            padding: 1.3px 2px;
            vertical-align: middle;
        }

        .c-no {
            width: 16px;
            color: #1e293b;
        }

        .c-lbl {
            width: 158px;
            color: #1e293b;
        }

        .c-val {
            vertical-align: middle;
        }

        /* Rectangular Text Input Box like the physical form */
        .field-box {
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            padding: 1.8px 5px;
            min-height: 12px;
            color: #0f172a;
            font-size: 7.8px;
            word-wrap: break-word;
        }

        .field-box-bold {
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            padding: 1.8px 5px;
            min-height: 12px;
            color: #0f172a;
            font-size: 7.8px;
            font-weight: bold;
        }

        /* Checkbox / Radio Box with Checkmark */
        .v-box {
            display: inline-block;
            width: 13px;
            height: 11px;
            line-height: 9.5px;
            text-align: center;
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            font-family: "DejaVu Sans", sans-serif;
            font-weight: bold;
            font-size: 8px;
            color: #0f172a;
            vertical-align: middle;
            margin-right: 3px;
        }

        .v-lbl {
            vertical-align: middle;
            font-size: 7.6px;
            color: #1e293b;
        }

        .opt-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .opt-grid td {
            padding: 1px 4px 1px 0;
            vertical-align: middle;
        }

        .indent-sub {
            padding-left: 14px !important;
        }

        /* Date Boxes DD / MM / YYYY */
        .date-box {
            display: inline-block;
            width: 24px;
            height: 12px;
            line-height: 11px;
            text-align: center;
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            font-size: 7.6px;
            color: #0f172a;
            vertical-align: middle;
        }

        .date-box-year {
            display: inline-block;
            width: 36px;
            height: 12px;
            line-height: 11px;
            text-align: center;
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            font-size: 7.6px;
            color: #0f172a;
            vertical-align: middle;
        }

        .slash-sep {
            display: inline-block;
            padding: 0 3px;
            font-weight: bold;
            color: #334155;
            vertical-align: middle;
        }

        /* Bottom Approval Table matching the scanned form */
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
            font-size: 7.5px;
            font-weight: bold;
            text-align: center;
            color: #1e293b;
            width: 20%;
        }

        .approval-table th:last-child,
        .approval-table td:last-child {
            border-right: none;
        }

        .sign-area {
            height: 46px;
            border-bottom: 0.9px solid #334155;
            border-right: 0.9px solid #334155;
            padding: 3px 4px;
            text-align: center;
            vertical-align: middle;
        }

        .sign-stamp {
            font-weight: bold;
            font-size: 7.8px;
            color: #166534;
            margin-bottom: 2px;
        }

        .sign-meta {
            font-size: 6.8px;
            color: #475569;
            line-height: 1.15;
            word-wrap: break-word;
        }

        .name-row-cell {
            border-bottom: 0.9px solid #334155;
            border-right: 0.9px solid #334155;
            padding: 2.5px 4px;
            font-size: 7.2px;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
        }

        .date-row-cell {
            border-right: 0.9px solid #334155;
            padding: 2.5px 4px;
            font-size: 7.2px;
            color: #0f172a;
        }

        .date-line-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-cell {
            border-right: 0.9px solid #334155;
            padding: 3.5px 5px;
            font-size: 7.4px;
            color: #0f172a;
            line-height: 1.3;
        }
    </style>
</head>

<body>
    <div class="outer-frame">
        <!-- FULL-WIDTH COMPANY HEADER AT THE VERY TOP -->
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

        <!-- TOP HEADER: No. Form & Master Data Customer Request Title Box -->
        <div class="top-area">
            <div class="no-form-row">
                No. Form : <strong>{{ $submission->number ?? '-' }}</strong>
            </div>
            <table class="banner-table">
                <tr>
                    <td class="title-banner">Master Data Customer Request</td>
                    <td></td>
                </tr>
            </table>
        </div>

        <!-- TOP STRIP: Request Type & Customer Code -->
        <div class="request-type-strip">
            <table class="strip-table">
                <tr>
                    @foreach($choiceGroups['customer_request_type'] ?? [] as $opt)
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
                    <td style="width: 85px; font-weight: bold;">Customer Code</td>
                    <td style="width: 145px;">
                        <div class="field-box-bold">{{ $form['customerCode'] ?? '' }}</div>
                    </td>
                    <td></td>
                </tr>
            </table>
        </div>

        <!-- SECTION: REQUESTER -->
        <div class="section-bar">Requester</div>
        <div class="section-content">
            <table class="rows-table">
                <tr>
                    <td class="c-no">1.</td>
                    <td class="c-lbl">Name</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 48%; padding: 0;">
                                    <div class="field-box">{{ $requestor['name'] }}</div>
                                </td>
                                <td style="width: 52%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">2.</td>
                    <td class="c-lbl">Position (Jabatan)</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 48%; padding: 0;">
                                    <div class="field-box">{{ $requestor['position'] }}</div>
                                </td>
                                <td style="width: 52%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">3.</td>
                    <td class="c-lbl">Division / Department</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $requestor['division'] }}</div>
                                </td>
                                <td style="width: 3%; text-align: center; font-weight: bold; padding: 0;">/</td>
                                <td style="width: 53%; padding: 0;">
                                    <div class="field-box">{{ $requestor['department'] }}</div>
                                </td>
                                <td style="width: 10%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">4.</td>
                    <td class="c-lbl">Telp &amp; Email</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ ($form['telephone1'] ?? '') ?: $requestor['telephone'] }}</div>
                                </td>
                                <td style="width: 3%; padding: 0;"></td>
                                <td style="width: 53%; padding: 0;">
                                    <div class="field-box">{{ $requestor['email'] }}</div>
                                </td>
                                <td style="width: 10%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        <!-- SECTION: INITIAL SCREEN -->
        <div class="section-bar">Initial Screen</div>
        <div class="section-content">
            <table class="rows-table">
                <!-- 1. Account Group -->
                <tr>
                    <td class="c-no" style="vertical-align: top; padding-top: 2px;">1.</td>
                    <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Account Group</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            @foreach(array_chunk($choiceGroups['customer_account_group'] ?? [], 4) as $chunk)
                            <tr>
                                @foreach($chunk as $opt)
                                <td style="width: 25%;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                </td>
                                @endforeach
                                @for($i = count($chunk); $i < 4; $i++)
                                    <td style="width: 25%;">
                    </td>
                    @endfor
                </tr>
                @endforeach
            </table>
            </td>
            </tr>
            <!-- 2. Company Code -->
            <tr>
                <td class="c-no">2.</td>
                <td class="c-lbl">Company Code</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['customer_company_code'] ?? [] as $opt)
                            <td style="width: 25%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- 3. Sales Organization -->
            <tr>
                <td class="c-no">3.</td>
                <td class="c-lbl">Sales Organization</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['customer_sales_organization'] ?? [] as $opt)
                            <td style="width: 25%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- 4. Distribution Channel -->
            <tr>
                <td class="c-no">4.</td>
                <td class="c-lbl">Distribution Channel</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['customer_distribution_channel'] ?? [] as $opt)
                            <td style="width: 25%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- 5. Division -->
            <tr>
                <td class="c-no">5.</td>
                <td class="c-lbl">Division</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['customer_division'] ?? [] as $opt)
                            <td style="width: 25%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            <td></td>
                        </tr>
                    </table>
                </td>
            </tr>
            </table>
        </div>

        <!-- SECTION: GENERAL DATA -->
        <div class="section-bar">General Data</div>
        <div class="section-content">
            <table class="rows-table">
                <tr>
                    <td class="c-no">7.</td>
                    <td class="c-lbl">Judul (Title)</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $form['title'] ?? '' }}</div>
                                </td>
                                <td style="width: 66%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">8.</td>
                    <td class="c-lbl">Nama Pelanggan (Name)</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 90%; padding: 0;">
                                    <div class="field-box">{{ $form['customerName'] ?? '' }}</div>
                                </td>
                                <td style="width: 10%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">9.</td>
                    <td class="c-lbl">Search Term</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $form['searchTerm'] ?? '' }}</div>
                                </td>
                                <td style="width: 66%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">10.</td>
                    <td class="c-lbl">Alamat Invoice (Street / House Number)</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 90%; padding: 0;">
                                    <div class="field-box">{{ $form['invoiceStreet'] ?? '' }}</div>
                                </td>
                                <td style="width: 10%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">11.</td>
                    <td class="c-lbl">Alamat Pajak</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 90%; padding: 0;">
                                    <div class="field-box">{{ $form['taxStreet'] ?? '' }}</div>
                                </td>
                                <td style="width: 10%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">12.</td>
                    <td class="c-lbl">Kota / Kode Pos</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $form['city'] ?? '' }}</div>
                                </td>
                                <td style="width: 3%; padding: 0;"></td>
                                <td style="width: 18%; padding: 0;">
                                    <div class="field-box" style="text-align: center;">{{ $form['postalCode'] ?? '' }}</div>
                                </td>
                                <td style="width: 45%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">13.</td>
                    <td class="c-lbl">Country</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $form['country'] ?? '' }}</div>
                                </td>
                                <td style="width: 66%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">14.</td>
                    <td class="c-lbl">Region</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $form['region'] ?? '' }}</div>
                                </td>
                                <td style="width: 66%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">15.</td>
                    <td class="c-lbl">Telephone</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $form['telephone2'] ?? '' }}</div>
                                </td>
                                <td style="width: 66%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">16.</td>
                    <td class="c-lbl">Fax</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $form['fax'] ?? '' }}</div>
                                </td>
                                <td style="width: 66%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">17.</td>
                    <td class="c-lbl">NPWP (VAT Reg. No.)</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 34%; padding: 0;">
                                    <div class="field-box">{{ $form['npwp'] ?? '' }}</div>
                                </td>
                                <td style="width: 3%; padding: 0;"></td>
                                <td style="width: 63%; padding: 0;">
                                    <span style="margin-right: 4px;">Tanggal Terdaftar :</span>
                                    <span class="date-box">{{ $npwpDateParts['day'] }}</span>
                                    <span class="slash-sep">/</span>
                                    <span class="date-box">{{ $npwpDateParts['month'] }}</span>
                                    <span class="slash-sep">/</span>
                                    <span class="date-box-year">{{ $npwpDateParts['year'] }}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">18.</td>
                    <td class="c-lbl">Customer Class</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            <tr>
                                @foreach($choiceGroups['customer_class'] ?? [] as $opt)
                                <td style="width: 34%;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                </td>
                                @endforeach
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        <!-- SECTION: COMPANY CODE DATA -->
        <div class="section-bar">Company Code Data</div>
        <div class="section-content">
            <table class="rows-table">
                <!-- 1. Recon Account -->
                <tr>
                    <td class="c-no">1.</td>
                    <td class="c-lbl">Recon Account</td>
                    <td class="c-val">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 45%; padding: 0;">
                                    <div class="field-box">{{ $form['reconAccount'] ?? '' }}</div>
                                </td>
                                <td style="width: 55%; padding: 0;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- 2. Sort Key -->
                <tr>
                    <td class="c-no">2.</td>
                    <td class="c-lbl">Sort Key</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            <tr>
                                @foreach($choiceGroups['customer_sort_key'] ?? [] as $opt)
                                <td style="width: 45%;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                </td>
                                @endforeach
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- 3. Terms of payment -->
                <tr>
                    <td class="c-no" style="vertical-align: top; padding-top: 2px;">3.</td>
                    <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Terms of Payment</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            @foreach($choiceGroups['customer_payment_terms'] ?? [] as $opt)
                            <tr>
                                <td>
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">
                                        <span style="display: inline-block; width: 28px;">{{ $opt['value'] }}</span>
                                        @if($opt['label'] && $opt['label'] !== $opt['value'])
                                        {{ $opt['label'] }}
                                        @endif
                                    </span>
                                </td>
                            </tr>
                            @endforeach
                        </table>
                    </td>
                </tr>
                <!-- 4. Tolerance Group -->
                <tr>
                    <td class="c-no">4.</td>
                    <td class="c-lbl">Tolerance Group</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            <tr>
                                @foreach($choiceGroups['customer_tolerance_group'] ?? [] as $opt)
                                <td style="width: 45%;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                </td>
                                @endforeach
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- 5. Witholding Tax -->
                <tr>
                    <td class="c-no" style="vertical-align: top; padding-top: 2px;">5.</td>
                    <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Witholding Tax</td>
                    <td class="c-val">
                        @php
                        $wTaxOptions = collect($choiceGroups['customer_witholding_tax'] ?? []);
                        $leftTax = $wTaxOptions->filter(fn($o) => str_starts_with(strtoupper($o['value']), 'P4') || str_starts_with(strtoupper($o['value']), '4'))->values();
                        $rightTax = $wTaxOptions->reject(fn($o) => str_starts_with(strtoupper($o['value']), 'P4') || str_starts_with(strtoupper($o['value']), '4'))->values();
                        @endphp
                        @if($leftTax->isNotEmpty() && $rightTax->isNotEmpty())
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 45%; vertical-align: top; padding: 0;">
                                    <table class="opt-grid">
                                        @foreach($leftTax as $opt)
                                        @php
                                        $indentLeft = str_starts_with(strtoupper($opt['value']), '4') && $leftTax->count() > 1;
                                        @endphp
                                        <tr>
                                            <td class="{{ $indentLeft ? 'indent-sub' : '' }}">
                                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                            </td>
                                        </tr>
                                        @endforeach
                                    </table>
                                </td>
                                <td style="width: 55%; vertical-align: top; padding: 0;">
                                    <table class="opt-grid">
                                        @foreach($rightTax as $opt)
                                        @php
                                        $indentRight = str_starts_with(strtoupper($opt['value']), '5') && $rightTax->contains(fn($r) => strtoupper($r['value']) === 'P5');
                                        @endphp
                                        <tr>
                                            <td class="{{ $indentRight ? 'indent-sub' : '' }}">
                                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                            </td>
                                        </tr>
                                        @endforeach
                                    </table>
                                </td>
                            </tr>
                        </table>
                        @else
                        <table class="opt-grid">
                            @foreach(array_chunk($choiceGroups['customer_witholding_tax'] ?? [], 2) as $chunk)
                            <tr>
                                @foreach($chunk as $opt)
                                <td style="width: 50%;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                </td>
                                @endforeach
                            </tr>
                            @endforeach
                        </table>
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <!-- SECTION: SALES AREA DATA -->
        <div class="section-bar">Sales Area Data</div>
        <div class="section-content">
            <table class="rows-table">
                <!-- 1. Currency -->
                <tr>
                    <td class="c-no">1.</td>
                    <td class="c-lbl">Currency</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            <tr>
                                @foreach($choiceGroups['customer_currency'] ?? [] as $opt)
                                <td style="width: 22%;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                </td>
                                @endforeach
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- 2. Customer Pricing Procedure -->
                <tr>
                    <td class="c-no">2.</td>
                    <td class="c-lbl">Customer Pricing Procedure</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            <tr>
                                @foreach($choiceGroups['customer_pricing_procedure'] ?? [] as $opt)
                                <td style="width: 22%;">
                                    <span class="v-box">{{ $opt['checked'] ? $opt['value'] : '' }}</span>
                                    <span class="v-lbl">{{ $opt['label'] && $opt['label'] !== $opt['value'] ? $opt['label'] : $opt['value'] }}</span>
                                </td>
                                @endforeach
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- 3. Customer Statistic Group -->
                <tr>
                    <td class="c-no">3.</td>
                    <td class="c-lbl">Customer Statistic Group</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            <tr>
                                @foreach($choiceGroups['customer_statistic_group'] ?? [] as $opt)
                                <td style="width: 22%;">
                                    <span class="v-box">{{ $opt['checked'] ? $opt['value'] : '' }}</span>
                                    <span class="v-lbl">{{ $opt['label'] && $opt['label'] !== $opt['value'] ? $opt['label'] : $opt['value'] }}</span>
                                </td>
                                @endforeach
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- 4. Tax Classification -->
                <tr>
                    <td class="c-no">4.</td>
                    <td class="c-lbl">Tax Classification</td>
                    <td class="c-val">
                        <table class="opt-grid">
                            <tr>
                                @foreach($choiceGroups['customer_tax_classification'] ?? [] as $opt)
                                <td style="width: 22%;">
                                    <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                    <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                                </td>
                                @endforeach
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        <!-- FOOTER APPROVAL TABLE (5 COLUMNS MATCHING WORKFLOW, NO CHECKED BY) -->
        <table class="approval-table">
            <thead>
                <tr>
                    <th>Requested by</th>
                    <th>Approved by<br>Div. Head Requestor</th>
                    <th>Approved by<br>Accounting Div. Head</th>
                    <th>Approved by<br>Tax Div. Head</th>
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
                        <strong>Name :</strong> {{ $approvals['tax']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['tax']['date'] ?: '-' }}
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