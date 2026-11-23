<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>SAP GL Request - {{ $submission->number ?? '-' }}</title>
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
            font-size: 8.5px;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.25;
        }

        .outer-frame {
            border: 1.5px solid #334155;
            padding-bottom: 10px;
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
            padding: 8px 14px;
        }

        .no-form-row {
            text-align: right;
            font-size: 8.5px;
            color: #1e293b;
            margin-bottom: 2px;
        }

        .doc-title {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            text-decoration: underline;
            margin: 4px 0 10px 0;
            color: #0f172a;
            letter-spacing: 0.4px;
        }

        .roman-heading {
            font-size: 9.5px;
            font-weight: bold;
            text-decoration: underline;
            margin: 8px 0 4px 0;
            color: #0f172a;
        }

        .field-table {
            width: 100%;
            border-collapse: collapse;
            margin-left: 10px;
        }

        .field-table td {
            padding: 2px 3px;
            vertical-align: middle;
        }

        .f-bullet {
            width: 10px;
            color: #1e293b;
        }

        .f-label {
            width: 165px;
            color: #1e293b;
        }

        .f-colon {
            width: 10px;
            text-align: center;
        }

        .f-value {
            color: #0f172a;
        }

        .dotted-val {
            border-bottom: 1px dotted #64748b;
            min-height: 13px;
            padding: 1px 4px;
            display: inline-block;
            width: 78%;
            font-weight: bold;
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
            margin-right: 3px;
        }

        .v-lbl {
            vertical-align: middle;
            font-size: 8.3px;
            color: #1e293b;
            margin-right: 16px;
        }

        /* GL Account List Table */
        .gl-table {
            width: 94%;
            margin: 6px 0 6px 14px;
            border-collapse: collapse;
        }

        .gl-table th {
            border: 1px solid #334155;
            background-color: #f1f5f9;
            padding: 3.5px 6px;
            font-size: 8.3px;
            font-weight: bold;
            text-align: center;
            color: #0f172a;
        }

        .gl-table td {
            border: 1px solid #334155;
            padding: 3.5px 6px;
            font-size: 8.3px;
            color: #0f172a;
        }

        /* Approval Table matching GL Account Request sample */
        .approval-table {
            width: 96%;
            margin: 12px auto 0 auto;
            border-collapse: collapse;
            border: 1px solid #334155;
        }

        .approval-table th {
            background-color: #f8fafc;
            border: 1px solid #334155;
            padding: 3.5px 4px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            color: #0f172a;
            width: 20%;
        }

        .sign-cell {
            height: 50px;
            border: 1px solid #334155;
            padding: 4px;
            text-align: center;
            vertical-align: middle;
        }

        .sign-stamp {
            font-weight: bold;
            font-size: 8px;
            color: #166534;
            margin-bottom: 2px;
        }

        .sign-meta {
            font-size: 7px;
            color: #475569;
            line-height: 1.15;
            word-wrap: break-word;
        }

        .meta-cell {
            border: 1px solid #334155;
            padding: 3px 5px;
            font-size: 7.5px;
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

    <div class="content-body">
        <div class="no-form-row">
            No. Form : <strong>{{ $submission->number ?? '-' }}</strong>
        </div>

        <div class="doc-title">GL ACCOUNT REQUEST</div>

        <!-- I. REQUESTER INFORMATION -->
        <div class="roman-heading">I. Requester Information:</div>
        <table class="field-table">
            <tr>
                <td class="f-bullet">&bull;</td>
                <td class="f-label">Company Code</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_company_code'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="f-bullet">&bull;</td>
                <td class="f-label">Type of Request</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_request_type'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="f-bullet">&bull;</td>
                <td class="f-label">Name of Requester</td>
                <td class="f-colon">:</td>
                <td class="f-value">{{ $requestor['name'] ?: '-' }}</td>
            </tr>
            <tr>
                <td class="f-bullet">&bull;</td>
                <td class="f-label">Position</td>
                <td class="f-colon">:</td>
                <td class="f-value">{{ $requestor['position'] ?: '-' }}</td>
            </tr>
            <tr>
                <td class="f-bullet">&bull;</td>
                <td class="f-label">Department</td>
                <td class="f-colon">:</td>
                <td class="f-value">{{ $requestor['department'] ?: '-' }}</td>
            </tr>
            <tr>
                <td class="f-bullet">&bull;</td>
                <td class="f-label">Purpose of Use</td>
                <td class="f-colon">:</td>
                <td class="f-value">{{ ($form['purposeOfUse'] ?? '') ?: '-' }}</td>
            </tr>
            <tr>
                <td class="f-bullet">&bull;</td>
                <td class="f-label">Account Group</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_account_group'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}@if($opt['label'] && $opt['label'] !== $opt['value']) {{ $opt['label'] }}@endif</span>
                    @endforeach
                </td>
            </tr>
        </table>

        <!-- GL ACCOUNT DETAILS TABLE -->
        @php
            $glRows = is_array($form['glAccount'] ?? null) && count($form['glAccount']) > 0
                ? $form['glAccount']
                : [['gl' => '', 'shortText' => '', 'longText' => '']];
        @endphp
        <table class="gl-table">
            <thead>
                <tr>
                    <th style="width: 24%;">G/L Account</th>
                    <th style="width: 34%;">Short Text</th>
                    <th style="width: 42%;">G/L Acct Long Text</th>
                </tr>
            </thead>
            <tbody>
                @foreach($glRows as $row)
                    <tr>
                        <td style="text-align: center;">{{ $row['gl'] ?? '-' }}</td>
                        <td>{{ $row['shortText'] ?? '-' }}</td>
                        <td>{{ $row['longText'] ?? '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- II. CONTROL DATA -->
        <div class="roman-heading">II. Control Data:</div>
        <table class="field-table">
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Account Currency</td>
                <td class="f-colon">:</td>
                <td class="f-value"><span class="dotted-val">{{ $form['accountCurrency'] ?? '' }}</span></td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Only Bal. in Local Crcy.</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_only_balances_local_currency'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Tax Category</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_tax_category'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Posting w/o Tax Allowed</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_posting_without_tax'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Recon. Acct for acct.type</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_recon_acct_for_acct_type'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Open Item Management</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_open_item_management'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Line Item Display</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_line_item_display'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Sort key</td>
                <td class="f-colon">:</td>
                <td class="f-value"><span class="dotted-val">{{ $form['sortKey'] ?? '' }}</span></td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Field status Group</td>
                <td class="f-colon">:</td>
                <td class="f-value"><span class="dotted-val">{{ $form['fieldStatusGroup'] ?? '' }}</span></td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Posting Automatically only</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_posting_automatically_only'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
        </table>

        <!-- III. GL ACCOUNT BANK DATA -->
        <div class="roman-heading">III. GL Account Bank Data:</div>
        <table class="field-table">
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Bank Country</td>
                <td class="f-colon">:</td>
                <td class="f-value"><span class="dotted-val">{{ $form['bankCountry'] ?? '' }}</span></td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Bank Key</td>
                <td class="f-colon">:</td>
                <td class="f-value"><span class="dotted-val">{{ $form['bankKey'] ?? '' }}</span></td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Bank Name</td>
                <td class="f-colon">:</td>
                <td class="f-value"><span class="dotted-val">{{ $form['bankName'] ?? '' }}</span></td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Bank Account Number</td>
                <td class="f-colon">:</td>
                <td class="f-value"><span class="dotted-val">{{ $form['bankAccountNumber'] ?? '' }}</span></td>
            </tr>
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Currency</td>
                <td class="f-colon">:</td>
                <td class="f-value"><span class="dotted-val">{{ $form['currency'] ?? '' }}</span></td>
            </tr>
        </table>

        <!-- IV. ASSIGNMENT SOURCE GROUP -->
        <div class="roman-heading">IV. Assignment Source Group:</div>
        <table class="field-table">
            <tr>
                <td class="f-bullet"></td>
                <td class="f-label">Cost Element Group</td>
                <td class="f-colon">:</td>
                <td class="f-value">
                    @foreach($choiceGroups['gl_cost_element_group'] ?? [] as $opt)
                        <span class="v-box">{!! $opt['checked'] ? '&#10004;' : '' !!}</span>
                        <span class="v-lbl">{{ $opt['value'] }}</span>
                    @endforeach
                </td>
            </tr>
        </table>

        <!-- APPROVAL TABLE (MATCHING GL WORKFLOW: Requestor, Acc Dept Head, Acc Head, Div Head, IT-SAP) -->
        <table class="approval-table">
            <thead>
                <tr>
                    <th>Requested by</th>
                    <th>Approved by<br>Accounting Dept. Head</th>
                    <th>Approved by<br>Accounting Div. Head</th>
                    <th>Approved by<br>Div. Head Requestor</th>
                    <th>Handled by<br>IT-SAP</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="meta-cell">
                        <strong>Name :</strong> {{ $approvals['requestor']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['requestor']['date'] ?: '-' }}
                    </td>
                    <td class="meta-cell">
                        <strong>Name :</strong> {{ $approvals['acc_dept_head']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['acc_dept_head']['date'] ?: '-' }}
                    </td>
                    <td class="meta-cell">
                        <strong>Name :</strong> {{ $approvals['accounting']['name'] ?: '-' }}<br>
                        <strong>Date :</strong> {{ $approvals['accounting']['date'] ?: '-' }}
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
