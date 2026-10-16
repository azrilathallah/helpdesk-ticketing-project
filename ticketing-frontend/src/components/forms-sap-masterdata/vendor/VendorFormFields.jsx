import { Trash2, Upload, Paperclip, FileText } from "lucide-react";

/* =========================================================
   OPTIONS
========================================================= */

export const REQUEST_TYPES = [
  ["New"],
  ["Change"],
  ["Delete / Inactive"],
  ["Block"],
];

export const ACCOUNT_GROUPS = [
  ["Z080", "Employee-Internal"],
  ["Z090", "Employee-Outsources"],
  ["Z100", "Employee-Elabram"],
  ["Z110", "Employee-CA"],
  ["Z120", "Employee-IBS"],
];

export const RECON_ACCOUNTS = [
  ["31000310", "Trade A/P-3rd Party"],
  ["31000320", "Trade A/P-Affiliated"],
  ["32000210", "Non Trade A/P-3rd Party"],
  ["32000220", "Non Trade A/P-Affiliated"],
  ["34000510", "Employee Payable"],
];

export const PAYMENT_METHODS = [
  ["Transfer"],
  ["Giro"],
  ["Cash/Kontan"],
  ["Cheque"],
  ["C/L"],
];

export const WITHOLDING_TAX = [
  ["I1", "PPH4(2) - Invoice Deduction"],
  ["I2", "PPH21 - Invoice Deduction"],
  ["I3", "PPH23 - Invoice Deduction"],
  ["I4", "PPH26 - Invoice Deduction"],
];

export const COMPANY_CODES = [["1200"], ["1300"]];

export const DUE_DATE_PAYMENTS = [
  ["AP00", "AP-Due Net Immediately"],
  ["AP01", "AP-Due Net 7 days"],
  ["AP02", "AP-Due Net 14 days"],
  ["AP03", "AP-Due Net 21 days"],
  ["AP04", "AP-Due Net 30 days"],
  ["AP05", "AP-Due Net 60 days"],
];

export const CURRENCIES = [["IDR"], ["USD"]];

/* =========================================================
   DEFAULT FORM
========================================================= */

export const DEFAULT_VENDOR_FORM = {
  requestType: "New",
  vendorCode: "",
  name: "",
  searchTerm: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "Indonesia",
  telephone: "",
  fax: "",
  contactPerson: "",
  npwp: "",
  email: "",
  businessType: "",
  accountGroup: "",
  recontAccount: "",
  paymentMethod: [],
  witholdingTax: [],
  companyCode: "1200",
  dueDatePayment: "AP01",
  currency: "IDR",
  salesperson: "",
  paymentTransactions: [
    {
      bankName: "",
      bankAccountNumber: "",
      benificiary: "",
      bankCurrency: "IDR",
      swiftCode: "",
    },
  ],
};

export const validateAttachments = (files) => {
  if (!files || files.length === 0) return "";

  const maxSize = 10 * 1024 * 1024;

  if (files.length === 1) {
    return files[0].size > maxSize ? "Ukuran file maksimal 10 MB." : "";
  }

  return "Jika mengunggah lebih dari 1 file, harap kompres menjadi satu file ZIP.";
};

/* =========================================================
   STYLE HELPERS
========================================================= */

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

const requiredClass = "ml-0.5 text-red-600";

function isEditable({ mode, readOnly, approvalRole, field }) {
  if (readOnly) return false;
  if (mode === "create") return true;
  if (mode === "submission") return false;
  if (mode !== "approval") return false;

  if (approvalRole === "accounting") {
    return ["accountGroup", "recontAccount", "paymentMethod"].includes(field);
  }

  if (approvalRole === "tax") {
    return field === "witholdingTax";
  }

  if (approvalRole === "pic") {
    return field === "vendorCode";
  }

  return false;
}

/* =========================================================
   SHARED PRESENTATIONAL COMPONENTS
========================================================= */

export function Section({ number, title, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
          {number}
        </span>

        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}

export function Field({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className={requiredClass}>*</span>}
      </label>

      {children}
    </div>
  );
}

export function ReadOnlyField({ label, value, lockedBy = "" }) {
  const displayValue =
    value !== undefined && value !== null && String(value).trim() !== ""
      ? value
      : "-";

  return (
    <Field label={label} >
      <input type="text" className={inputClass} value={displayValue} readOnly />

      {lockedBy && (
        <span className="mt-1 block text-xs text-slate-500">{lockedBy}</span>
      )}
    </Field>
  );
}

export function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  checkbox = false,
  disabled = false,
  required = false,
}) {
  const normalizedValue = value || (checkbox ? [] : "");

  const checkboxGroupEmpty =
    checkbox && Array.isArray(normalizedValue) && normalizedValue.length === 0;

  return (
    <Field label={label} required={required}>
      <div
        className={`grid grid-cols-1 gap-2 ${
          options.length > 2 ? "sm:grid-cols-2" : ""
        }`}
      >
        {options.map((option, index) => {
          const [code, name] = Array.isArray(option) ? option : [option, ""];

          const checked = checkbox
            ? Array.isArray(normalizedValue) && normalizedValue.includes(code)
            : normalizedValue === code;

          const inputRequired = checkbox
            ? required && !disabled && checkboxGroupEmpty && index === 0
            : required && !disabled;

          return (
            <label
              key={code}
              className={`flex min-w-0 items-start gap-2.5 rounded-lg border px-3 py-3 text-sm transition ${
                disabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
                  : checked
                    ? "cursor-pointer border-blue-400 bg-blue-50 text-blue-900"
                    : "cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <input
                type={checkbox ? "checkbox" : "radio"}
                name={checkbox ? undefined : label}
                value={code}
                checked={checked}
                disabled={disabled}
                required={inputRequired}
                onChange={(event) => {
                  if (disabled || !onChange) return;

                  if (!checkbox) {
                    onChange(event.target.value);
                    return;
                  }

                  const currentList = Array.isArray(normalizedValue)
                    ? normalizedValue
                    : [];

                  onChange(
                    event.target.checked
                      ? [...currentList, event.target.value]
                      : currentList.filter(
                          (item) => item !== event.target.value,
                        ),
                  );
                }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
              />

              <span className="min-w-0 wrap-break-word">
                <strong className="font-semibold">{code}</strong>
                {name && ` ${name}`}
              </span>
            </label>
          );
        })}
      </div>
    </Field>
  );
}

/* =========================================================
   ATTACHMENT
========================================================= */

export function AttachmentField({
  label = "Attachment",
  files = [],
  existingFiles = [],
  onChange,
  error = "",
  disabled = false,
}) {
  const handleFileChange = (event) => {
    if (disabled) return;

    onChange?.(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleRemove = (index) => {
    if (disabled) return;

    onChange?.(files.filter((_, fileIndex) => fileIndex !== index));
  };

  const formatSize = (bytes) => {
    if (!bytes) return "File";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-w-0 sm:col-span-2">
      <label className={labelClass}>{label}</label>

      {!disabled && (
        <div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Upload size={20} />
            </span>

            <span className="text-sm font-semibold text-slate-800">
              Klik untuk unggah file
            </span>

            <span className="mt-1 text-xs leading-5 text-slate-500">
              Satu file atau beberapa file dalam satu ZIP. Maksimal 10 MB.
            </span>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <FileText className="h-5 w-5 shrink-0 text-slate-500" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Hapus ${file.name}`}
                    title="Hapus file"
                    onClick={() => handleRemove(index)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      {disabled && existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
            >
              <Paperclip className="h-5 w-5 shrink-0 text-slate-500" />

              <div className="min-w-0 flex-1">
                <p className="wrap-break-word text-sm font-medium text-slate-800">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {file.size ? formatSize(file.size) : file.type || "File"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {disabled && existingFiles.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <Paperclip className="h-5 w-5 text-slate-400" />
          <p className="text-sm text-slate-500">
            Tidak ada attachment yang diunggah.
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PAYMENT TRANSACTIONS TABLE
========================================================= */

const EMPTY_PAYMENT_TRANSACTION = {
  bankName: "",
  bankAccountNumber: "",
  benificiary: "",
  bankCurrency: "IDR",
  swiftCode: "",
};

export function PaymentTransactionsTable({
  label,
  value = [],
  onChange,
  disabled = false,
  required = false,
}) {
  const rows =
    Array.isArray(value) && value.length > 0
      ? value
      : [{ ...EMPTY_PAYMENT_TRANSACTION }];

  const updateRow = (index, field, newValue) => {
    const updatedRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: newValue } : row,
    );

    onChange?.(updatedRows);
  };

  const addRow = () => {
    onChange?.([...rows, { ...EMPTY_PAYMENT_TRANSACTION }]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;

    onChange?.(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="w-full min-w-0 sm:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className={labelClass}>{label} <span className={requiredClass}>*</span></label>

        {!disabled && (
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-3xl font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <span className="text-lg leading-none">+</span>
            Add Bank Account
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-212.5 border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="w-12 border-b border-slate-200 px-3 py-3 text-center">
                No.
              </th>
              <th className="border-b border-slate-200 px-3 py-3">Bank Name</th>
              <th className="border-b border-slate-200 px-3 py-3">
                Account Number
              </th>
              <th className="border-b border-slate-200 px-3 py-3">
                Beneficiary
              </th>
              <th className="w-28 border-b border-slate-200 px-3 py-3">
                Currency
              </th>
              <th className="border-b border-slate-200 px-3 py-3">
                Swift Code
              </th>
              {!disabled && (
                <th className="w-14 border-b border-slate-200 px-2 py-3" />
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index} className="bg-white hover:bg-slate-50">
                <td className="px-3 py-3 text-center text-slate-500">
                  {index + 1}
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.bankName || ""}
                    onChange={(event) =>
                      updateRow(index, "bankName", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`Bank Name ${index + 1}`}
                  />
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.bankAccountNumber || ""}
                    onChange={(event) =>
                      updateRow(index, "bankAccountNumber", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`Account Number ${index + 1}`}
                  />
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.benificiary || ""}
                    onChange={(event) =>
                      updateRow(index, "benificiary", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`Beneficiary ${index + 1}`}
                  />
                </td>

                <td className="px-2 py-2">
                  <select
                    className={inputClass}
                    value={row.bankCurrency || "IDR"}
                    onChange={(event) =>
                      updateRow(index, "bankCurrency", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`Currency ${index + 1}`}
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                  </select>
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.swiftCode || ""}
                    onChange={(event) =>
                      updateRow(index, "swiftCode", event.target.value)
                    }
                    disabled={disabled}
                    aria-label={`Swift Code ${index + 1}`}
                  />
                </td>

                {!disabled && (
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={rows.length === 1}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                      title={
                        rows.length === 1
                          ? "Minimal satu rekening bank"
                          : "Hapus rekening bank"
                      }
                      aria-label={`Hapus rekening bank ${index + 1}`}
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN VENDOR FORM
========================================================= */

export default function VendorFormFields({
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
  requestor = {},
  attachments = [],
  setAttachments,
  existingAttachments = [],
  onVendorCodeChange,
}) {
  const form = {
    ...DEFAULT_VENDOR_FORM,
    ...(formData || {}),
  };

  const update = (name, value) => {
    setFormData?.((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const editable = (field) =>
    isEditable({
      mode,
      readOnly,
      approvalRole,
      field,
    });

  const isCreateMode = mode === "create";
  const isApprovalMode = mode === "approval";
  const isPIC = isApprovalMode && approvalRole === "pic";
  const isNewRequest = form.requestType === "New";
  const isAccounting = isApprovalMode && approvalRole === "accounting";
  const isTax = isApprovalMode && approvalRole === "tax";

  return (
    <div className="space-y-5">
      {/* 1. REQUEST TYPE */}
      <Section number="1" title="Request Type">
        <ChoiceGroup
          label="Request Type"
          options={REQUEST_TYPES}
          value={form.requestType}
          onChange={(value) => update("requestType", value)}
          required={isCreateMode}
          disabled={!editable("requestType")}
        />

        {isNewRequest && !isPIC ? (
          <ReadOnlyField
            label="Vendor Code"
            value={form.vendorCode || "-"}
          />
        ) : (
          <Field label="Vendor Code" required={isPIC || isCreateMode}>
            <input
              type="text"
              className={inputClass}
              value={form.vendorCode || ""}
              onChange={(event) => {
                const value = event.target.value;
                update("vendorCode", value);
                onVendorCodeChange?.(value);
              }}
              placeholder="Masukkan vendor code"
              required={isPIC || isCreateMode}
              disabled={!editable("vendorCode")}
            />
          </Field>
        )}
      </Section>

      {/* 2. GENERAL DATA */}
      <Section number="2" title="General Data">
        <Field label="Name" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.name || ""}
            onChange={(event) => update("name", event.target.value)}
            required={isCreateMode}
            disabled={!editable("name")}
          />
        </Field>

        <Field label="Search Term">
          <input
            type="text"
            className={inputClass}
            value={form.searchTerm || ""}
            onChange={(event) => update("searchTerm", event.target.value)}
            disabled={!editable("searchTerm")}
          />
        </Field>

        <Field
          label="Street Address (Domisili Perusahaan)"
          required={isCreateMode}
        >
          <input
            type="text"
            className={inputClass}
            value={form.streetAddress || ""}
            onChange={(event) => update("streetAddress", event.target.value)}
            required={isCreateMode}
            disabled={!editable("streetAddress")}
          />
        </Field>

        <Field label="City" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.city || ""}
            onChange={(event) => update("city", event.target.value)}
            required={isCreateMode}
            disabled={!editable("city")}
          />
        </Field>

        <Field label="Postal Code" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.postalCode || ""}
            onChange={(event) => update("postalCode", event.target.value)}
            required={isCreateMode}
            disabled={!editable("postalCode")}
          />
        </Field>

        <Field label="Country" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.country || ""}
            onChange={(event) => update("country", event.target.value)}
            required={isCreateMode}
            disabled={!editable("country")}
          />
        </Field>

        <Field label="Telephone">
          <input
            type="text"
            className={inputClass}
            value={form.telephone || ""}
            onChange={(event) => update("telephone", event.target.value)}
            disabled={!editable("telephone")}
          />
        </Field>

        <Field label="Fax">
          <input
            type="text"
            className={inputClass}
            value={form.fax || ""}
            onChange={(event) => update("fax", event.target.value)}
            disabled={!editable("fax")}
          />
        </Field>

        <Field label="Contact Person">
          <input
            type="text"
            className={inputClass}
            value={form.contactPerson || ""}
            onChange={(event) => update("contactPerson", event.target.value)}
            disabled={!editable("contactPerson")}
          />
        </Field>

        <Field label="NPWP">
          <input
            type="text"
            className={inputClass}
            value={form.npwp || ""}
            onChange={(event) => update("npwp", event.target.value)}
            disabled={!editable("npwp")}
          />
        </Field>

        <Field label="Email" required={isCreateMode}>
          <input
            type="email"
            className={inputClass}
            value={form.email || ""}
            onChange={(event) => update("email", event.target.value)}
            required={isCreateMode}
            disabled={!editable("email")}
          />
        </Field>

        <Field label="Business Type">
          <input
            type="text"
            className={inputClass}
            value={form.businessType || ""}
            onChange={(event) => update("businessType", event.target.value)}
            disabled={!editable("businessType")}
          />
        </Field>
      </Section>

      {/* 3. COMPANY CODE DATA — ACCOUNTING */}
      <Section number="3" title="Company Code Data (Accounting Dept)">
        <ChoiceGroup
          label="Account Group"
          options={ACCOUNT_GROUPS}
          value={form.accountGroup}
          onChange={(value) => update("accountGroup", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Recon Account"
          options={RECON_ACCOUNTS}
          value={form.recontAccount}
          onChange={(value) => update("recontAccount", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Payment Method"
          options={PAYMENT_METHODS}
          value={form.paymentMethod}
          onChange={(value) => update("paymentMethod", value)}
          checkbox
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Witholding Tax Type & Code"
          options={WITHOLDING_TAX}
          value={form.witholdingTax}
          onChange={(value) => update("witholdingTax", value)}
          checkbox
          required={isTax}
          disabled={!isTax}
        />
      </Section>

      {/* 4. COMPANY CODE DATA — PURCHASING */}
      <Section number="4" title="Company Code Data (Purch Dept)">
        <ChoiceGroup
          label="Company Code"
          options={COMPANY_CODES}
          value={form.companyCode}
          onChange={(value) => update("companyCode", value)}
          required={isCreateMode}
          disabled={!editable("companyCode")}
        />

        <ChoiceGroup
          label="Due Date Payment"
          options={DUE_DATE_PAYMENTS}
          value={form.dueDatePayment}
          onChange={(value) => update("dueDatePayment", value)}
          required={isCreateMode}
          disabled={!editable("dueDatePayment")}
        />
      </Section>

      {/* 5. PURCHASING ORGANIZATION DATA */}
      <Section number="5" title="Purchasing Organization Data">
        <ChoiceGroup
          label="Order Currency"
          options={CURRENCIES}
          value={form.currency}
          onChange={(value) => update("currency", value)}
          required={isCreateMode}
          disabled={!editable("currency")}
        />

        <Field label="Salesperson">
          <input
            type="text"
            className={inputClass}
            value={form.salesperson || ""}
            onChange={(event) => update("salesperson", event.target.value)}
            disabled={!editable("salesperson")}
          />
        </Field>
      </Section>

      {/* 6. PAYMENT TRANSACTIONS */}
      <Section number="6" title="Payment Transactions">
        <PaymentTransactionsTable
          label="Bank Account Details"
          value={form.paymentTransactions}
          onChange={(value) => update("paymentTransactions", value)}
          required={isCreateMode}
          disabled={!editable("paymentTransactions")}
        />
      </Section>

      {/* 7. ATTACHMENT */}
      <Section number="7" title="Attachment">
        <AttachmentField
          files={attachments}
          existingFiles={existingAttachments}
          onChange={setAttachments}
          disabled={!isCreateMode || readOnly}
          error={form.attachmentError}
        />
      </Section>
    </div>
  );
}