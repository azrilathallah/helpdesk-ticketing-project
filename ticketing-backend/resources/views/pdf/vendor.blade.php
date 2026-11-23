<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>SAP Vendor Request - {{ $submission->number ?? '-' }}</title>
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
            font-size: 7.7px;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.15;
        }

        .outer-frame {
            border: 1.5px solid #334155;
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

        .field-box {
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            padding: 1.8px 5px;
            min-height: 12px;
            color: #0f172a;
            font-size: 7.7px;
            word-wrap: break-word;
        }

        .field-box-bold {
            border: 0.8px solid #64748b;
            background-color: #ffffff;
            padding: 1.8px 5px;
            min-height: 12px;
            color: #0f172a;
            font-size: 7.7px;
            font-weight: bold;
        }

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
            font-size: 7.5px;
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

        /* Payment Transactions Table */
        .bank-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
        }

        .bank-table th {
            background-color: #4f6272;
            color: #ffffff;
            border: 0.8px solid #334155;
            padding: 3px 4px;
            font-size: 7.5px;
            font-weight: bold;
            text-align: center;
        }

        .bank-table td {
            border: 0.8px solid #64748b;
            padding: 2.5px 5px;
            font-size: 7.5px;
            height: 14px;
            color: #0f172a;
            text-align: center;
        }

        /* Bottom Approval Table */
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

    <!-- TOP HEADER: No. Form & Master Data Vendor Request Title Box -->
    <div class="top-area">
        <div class="no-form-row">
            No. Form : <strong>{{ $submission->number ?? '-' }}</strong>
        </div>
        <table class="banner-table">
            <tr>
                <td class="title-banner">Master Data Vendor Request</td>
                <td></td>
            </tr>
        </table>
    </div>

    <!-- TOP STRIP: Request Type & Vendor Code -->
    <div class="request-type-strip">
        <table class="strip-table">
            <tr>
                @foreach($choiceGroups['vendor_request_type'] ?? [] as $opt)
                <td style="width: 22%;">
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
                <td style="width: 85px; font-weight: bold;">Vendor Code</td>
                <td style="width: 145px;">
                    <div class="field-box-bold">{{ $form['vendorCode'] ?? '' }}</div>
                </td>
                <td></td>
            </tr>
        </table>
    </div>

    <!-- SECTION: GENERAL DATA -->
    <div class="section-bar">General Data</div>
    <div class="section-content">
        <table class="rows-table">
            <tr>
                <td class="c-no">1.</td>
                <td class="c-lbl">Name</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 75%; padding: 0;"><div class="field-box">{{ $form['name'] ?? '' }}</div></td>
                            <td style="width: 25%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">2.</td>
                <td class="c-lbl">Search Term</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['searchTerm'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">3.</td>
                <td class="c-lbl">Street Address (Domisili Perusahaan)</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 90%; padding: 0;"><div class="field-box">{{ $form['streetAddress'] ?? '' }}</div></td>
                            <td style="width: 10%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">4.</td>
                <td class="c-lbl">City</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['city'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">5.</td>
                <td class="c-lbl">Postal Code</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 25%; padding: 0;"><div class="field-box">{{ $form['postalCode'] ?? '' }}</div></td>
                            <td style="width: 75%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">6.</td>
                <td class="c-lbl">Country</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['country'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">7.</td>
                <td class="c-lbl">Telephone</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['telephone'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">8.</td>
                <td class="c-lbl">Fax</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['fax'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">9.</td>
                <td class="c-lbl">Contact Person</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['contactPerson'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">10.</td>
                <td class="c-lbl">NPWP</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['npwp'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">11.</td>
                <td class="c-lbl">Email</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 55%; padding: 0;"><div class="field-box">{{ $form['email'] ?? '' }}</div></td>
                            <td style="width: 45%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">12.</td>
                <td class="c-lbl">Business Type</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['businessType'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- SECTION: COMPANY CODE DATA (ACCOUNTING DEPT) -->
    <div class="section-bar">Company Code Data (Accounting Dept)</div>
    <div class="section-content">
        <table class="rows-table">
            <tr>
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">1.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Account Group</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['vendor_account_group'] ?? [], 3) as $chunk)
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
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">2.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Recon Account</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['vendor_recon_account'] ?? [], 2) as $chunk)
                        <tr>
                            @foreach($chunk as $opt)
                            <td style="width: 50%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            @if(count($chunk) < 2)
                            <td style="width: 50%;"></td>
                            @endif
                        </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no">3.</td>
                <td class="c-lbl">Payment Method</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['vendor_payment_method'] ?? [] as $opt)
                            <td style="width: 20%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">4.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Witholding Tax Type &amp; Code</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['vendor_witholding_tax'] ?? [], 2) as $chunk)
                        <tr>
                            @foreach($chunk as $opt)
                            <td style="width: 50%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            @if(count($chunk) < 2)
                            <td style="width: 50%;"></td>
                            @endif
                        </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- SECTION: COMPANY CODE DATA (PURCH DEPT) -->
    <div class="section-bar">Company Code Data (Purch Dept)</div>
    <div class="section-content">
        <table class="rows-table">
            <tr>
                <td class="c-no">1.</td>
                <td class="c-lbl">Company Code</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['vendor_company_code'] ?? [] as $opt)
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
                <td class="c-no" style="vertical-align: top; padding-top: 2px;">2.</td>
                <td class="c-lbl" style="vertical-align: top; padding-top: 2px;">Due Date Payment</td>
                <td class="c-val">
                    <table class="opt-grid">
                        @foreach(array_chunk($choiceGroups['vendor_due_date_payment'] ?? [], 2) as $chunk)
                        <tr>
                            @foreach($chunk as $opt)
                            <td style="width: 50%;">
                                <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                                <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                            </td>
                            @endforeach
                            @if(count($chunk) < 2)
                            <td style="width: 50%;"></td>
                            @endif
                        </tr>
                        @endforeach
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- SECTION: PURCHASING ORGANIZATION DATA -->
    <div class="section-bar">Purchasing Organization Data</div>
    <div class="section-content">
        <table class="rows-table">
            <tr>
                <td class="c-no">1.</td>
                <td class="c-lbl">Order Currency</td>
                <td class="c-val">
                    <table class="opt-grid">
                        <tr>
                            @foreach($choiceGroups['vendor_currency'] ?? [] as $opt)
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
            <tr>
                <td class="c-no">2.</td>
                <td class="c-lbl">Salesperson</td>
                <td class="c-val">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 40%; padding: 0;"><div class="field-box">{{ $form['salesperson'] ?? '' }}</div></td>
                            <td style="width: 60%; padding: 0;"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- SECTION: PAYMENT TRANSACTIONS -->
    <div class="section-bar">Payment Transactions</div>
    <div class="section-content">
        @php
            $bankRows = is_array($form['paymentTransactions'] ?? null) && count($form['paymentTransactions']) > 0
                ? $form['paymentTransactions']
                : [];
            $minRows = max(2, count($bankRows));
        @endphp
        <table class="bank-table">
            <thead>
                <tr>
                    <th style="width: 24%;">Bank Name</th>
                    <th style="width: 24%;">Bank Account Number</th>
                    <th style="width: 28%;">Beneficiary</th>
                    <th style="width: 12%;">Currency</th>
                    <th style="width: 12%;">Swift Code</th>
                </tr>
            </thead>
            <tbody>
                @for($i = 0; $i < $minRows; $i++)
                    @php
                        $b = $bankRows[$i] ?? [];
                    @endphp
                    <tr>
                        <td style="text-align: center;">{{ $b['bankName'] ?? '' }}</td>
                        <td style="text-align: center;">{{ $b['bankAccountNumber'] ?? '' }}</td>
                        <td style="text-align: center;">{{ $b['benificiary'] ?? ($b['beneficiary'] ?? '') }}</td>
                        <td style="text-align: center;">{{ !empty($b['bankName']) || !empty($b['bankAccountNumber']) ? ($b['bankCurrency'] ?? 'IDR') : '' }}</td>
                        <td style="text-align: center;">{{ $b['swiftCode'] ?? '' }}</td>
                    </tr>
                @endfor
            </tbody>
        </table>
    </div>

    <!-- FOOTER APPROVAL TABLE -->
    <table class="approval-table">
        <thead>
            <tr>
                <th>Requested by</th>
                <th>Approved by<br>Div. Head Requestor</th>
                <th>Approved by<br>Accounting</th>
                <th>Approved by<br>Tax</th>
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
