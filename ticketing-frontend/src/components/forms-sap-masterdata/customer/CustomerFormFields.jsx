import { Trash2, Upload, Paperclip, FileText } from "lucide-react";

export const REQUEST_TYPES = [
  ["New"],
  ["Change"],
  ["Extend"],
  ["Block / Unblock"],
];

export const ACCOUNT_GROUPS = [
  ["Z010", "Customer-Tenant"],
  ["Z020", "Customer-Non Tenant"],
  ["Z030", "Customer-Advertising Agency"],
  ["Z040", "Customer-Affiliated"],
  ["Z050", "Customer-Shareholder"],
  ["Z060", "Customer-Building Owner"],
  ["Z070", "Customer-OneTime"],
];

export const COMPANY_CODES = [["1200", "IBSW"]];

export const SALES_ORGANIZATION = [["1200", "IBSW"]];

export const DISTRIBUTION_CHANNELS = [["00", "Common"]];

export const DIVISIONS = [["00", "Common"]];

export const CUSTOMER_CLASSES = [
  ["01", "Standard"],
  ["03", "Government (WAPU)"],
];

export const SORT_KEYS = [
  ["002", "Document No., Fiscal Year"],
  ["022", "One Time Name/City"],
];

export const TERMS_OF_PAYMENT = [
  ["AR00", "Payable immediately Due net"],
  ["AR01", "Due in 14 days"],
  ["AR02", "Due in 30 days"],
  ["AR03", "Due in 60 days"],
  ["AR04", "Due in 365 days"],
  ["AR05", "Due in 2 years"],
];

export const TOLERANCE_GROUPS = [["1200", "Cust/Vend Tolerance"]];

export const WITHOLDING_TAX = [
  ["P4", "PPH4(2) - Customer Payment Deduction"],
  ["P5", "PPH23 - Customer Payment Deduction"],
];

export const CURRENCIES = ["IDR", "USD"];

export const CUSTOMER_PRICING_PROCEDURES = [["1", "Standard"]];

export const CUSTOMER_STATISTIC_GROUPS = [["1", "Standard"]];

export const TAX_CLASSIFICATIONS = [
  ["0", "No Tax"],
  ["1", "Tax"],
  ["2", "WAPU"],
];

/* =========================================================
   DEFAULT FORM
========================================================= */

export const DEFAULT_CUSTOMER_FORM = {
  requestType: "New",
  customerCode: "",

  accountGroup: "",
  companyCode: "1200",
  salesOrganization: "1200",
  distributionChannel: ["00"],
  division: ["00"],

  title: "",
  customerName: "",
  searchTerm: "",
  invoiceStreet: "",
  taxStreet: "",
  city: "",
  postalCode: "",
  country: "Indonesia",
  region: "",
  telephone: "",
  fax: "",
  npwp: "",
  npwpregisteredDate: "",
  customerClass: "",

  recontAccount: "",
  sortKey: "",
  paymentTerms: "",
  toleranceGroup: "",
  witholdingTax: [],

  currency: "IDR",
  customerPricingProcedure: ["1"],
  customerStatisticGroup: ["1"],
  taxClassification: "",
};

export const getUserValue = (user, keys) => {
  for (const key of keys) {
    const value = user?.[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }

  return "-";
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
   TAILWIND STYLE HELPERS
========================================================= */

const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs! text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

const requiredClass = "ml-0.5 text-red-600";

function isEditable({ mode, readOnly, approvalRole, field }) {
  if (readOnly) return false;
  if (mode === "create") return true;
  if (mode === "submission") return false;
  if (mode !== "approval") return false;

  if (approvalRole === "accounting") {
    return [
      "accountGroup",
      "recontAccount",
      "sortKey",
      "toleranceGroup",
    ].includes(field);
  }

  if (approvalRole === "tax") {
    return field === "witholdingTax";
  }

  if (approvalRole === "pic") {
    return field === "customerCode";
  }

  return false;
}

/* =========================================================
   SHARED PRESENTATIONAL COMPONENTS
========================================================= */

export function Section({ number, title, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
          {number}
        </span>

        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="flex flex-col gap-3 p-3 sm:p-4">
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
    <Field label={label}>
      <div className="relative">
        <input
          type="text"
          className={inputClass}
          value={displayValue}
          readOnly
        />

        {lockedBy && (
          <span className="mt-1 block text-xs font-medium text-slate-500">
            {lockedBy}
          </span>
        )}
      </div>
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
        className={`grid grid-cols-1 sm:grid-cols-2 gap-1.5 ${
          options.length > 2 ? "grid-cols-2" : ""
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
              className={`flex min-w-0 items-start gap-2 rounded-md border px-2.5 py-2 text-xs transition ${
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
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-blue-600"
              />

              <span className="min-w-0 wrap-break-word">
                <strong className="font-semibold">{code}</strong>
                {name && <span> {name}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </Field>
  );
}

export function PairedTextField({
  label,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  leftPlaceholder = "",
  rightPlaceholder = "",
  rightType = "text",
  separator = "/",
  requiredLeft = false,
  requiredRight = false,
  disabled = false,
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {(requiredLeft || requiredRight) && (
          <span className={requiredClass}>*</span>
        )}
      </label>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <input
          type="text"
          className={inputClass}
          value={leftValue || ""}
          onChange={(event) => onLeftChange?.(event.target.value)}
          placeholder={leftPlaceholder}
          required={requiredLeft && !disabled}
          disabled={disabled}
        />

        <span className="text-sm text-slate-400">{separator}</span>

        <input
          type={rightType}
          className={inputClass}
          value={rightValue || ""}
          onChange={(event) => onRightChange?.(event.target.value)}
          placeholder={rightPlaceholder}
          required={requiredRight && !disabled}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

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
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-3 text-center transition hover:border-blue-400 hover:bg-blue-50">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Upload size={16} />
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
                  <FileText className="h-4 w-4 shrink-0 text-slate-500" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Hapus ${file.name}`}
                    title="Hapus file"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 size={16} />
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
              <Paperclip className="h-4 w-4 shrink-0 text-slate-500" />

              <div className="min-w-0 flex-1">
                <p className="wrap-break-word text-xs font-medium text-slate-800">
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {file.size ? formatSize(file.size) : file.type || "File"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {disabled && existingFiles.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
          <Paperclip className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">
              Tidak ada attachment yang diunggah.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CUSTOMER FORM
========================================================= */

export default function CustomerFormFields({
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
  requestor = {},
  attachments = [],
  setAttachments,
  existingAttachments = [],
  onCustomerCodeChange,
}) {
  const form = {
    ...DEFAULT_CUSTOMER_FORM,
    ...(formData || {}),
  };

  const update = (name, value) => {
    setFormData?.((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const editable = (field) =>
    isEditable({ mode, readOnly, approvalRole, field });

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

        {isNewRequest ? (
          isPIC ? (
            <Field label="Customer Code" required>
              <input
                type="text"
                className={inputClass}
                value={form.customerCode || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  update("customerCode", value);
                  onCustomerCodeChange?.(value);
                }}
                placeholder="Masukkan customer code"
                required
              />
            </Field>
          ) : (
            <ReadOnlyField
              label="Customer Code"
              value={form.customerCode || "-"}
            />
          )
        ) : (
          <Field label="Customer Code" required={isCreateMode}>
            <input
              type="text"
              className={inputClass}
              value={form.customerCode || ""}
              onChange={(event) => update("customerCode", event.target.value)}
              placeholder="Masukkan customer code"
              required={isCreateMode}
              disabled={!editable("customerCode")}
            />
          </Field>
        )}
      </Section>

      {/* 2. REQUESTOR */}
      <Section number="2" title="Requestor">
        <ReadOnlyField label="Name" value={requestor.name} />
        <ReadOnlyField label="Position (Jabatan)" value={requestor.position} />

        <div className="min-w-0">
          <label className={labelClass}>Division / Department</label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <input
              type="text"
              className={inputClass}
              value={requestor.division || "-"}
              readOnly
            />
            <span className="text-sm text-slate-400">/</span>
            <input
              type="text"
              className={inputClass}
              value={requestor.department || "-"}
              readOnly
            />
          </div>
        </div>

        <ReadOnlyField label="Telephone" value={requestor.telephone} />
        <ReadOnlyField label="Email" value={requestor.email} />
      </Section>

      {/* 3. INITIAL SCREEN */}
      <Section number="3" title="Initial Screen">
        <ChoiceGroup
          label="Account Group"
          options={ACCOUNT_GROUPS}
          value={form.accountGroup}
          onChange={(value) => update("accountGroup", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Company Code"
          options={COMPANY_CODES}
          value={form.companyCode}
          onChange={(value) => update("companyCode", value)}
          required={isCreateMode}
          disabled={!editable("companyCode")}
        />

        <ChoiceGroup
          label="Sales Organization"
          options={SALES_ORGANIZATION}
          value={form.salesOrganization}
          onChange={(value) => update("salesOrganization", value)}
          required={isCreateMode}
          disabled={!editable("salesOrganization")}
        />

        <ChoiceGroup
          label="Distribution Channel"
          options={DISTRIBUTION_CHANNELS}
          value={form.distributionChannel}
          onChange={(value) => update("distributionChannel", value)}
          checkbox
          required={isCreateMode}
          disabled={!editable("distributionChannel")}
        />

        <ChoiceGroup
          label="Division"
          options={DIVISIONS}
          value={form.division}
          onChange={(value) => update("division", value)}
          checkbox
          required={isCreateMode}
          disabled={!editable("division")}
        />
      </Section>

      {/* 4. GENERAL DATA */}
      <Section number="4" title="General Data">
        <Field label="Judul (Title)" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.title || ""}
            onChange={(event) => update("title", event.target.value)}
            required={isCreateMode}
            disabled={!editable("title")}
          />
        </Field>

        <Field label="Nama Pelanggan (Name)" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.customerName || ""}
            onChange={(event) => update("customerName", event.target.value)}
            required={isCreateMode}
            disabled={!editable("customerName")}
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
          label="Alamat Invoice (Street / House Number)"
          required={isCreateMode}
        >
          <input
            type="text"
            className={inputClass}
            value={form.invoiceStreet || ""}
            onChange={(event) => update("invoiceStreet", event.target.value)}
            required={isCreateMode}
            disabled={!editable("invoiceStreet")}
          />
        </Field>

        <Field label="Alamat Pajak" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.taxStreet || ""}
            onChange={(event) => update("taxStreet", event.target.value)}
            required={isCreateMode}
            disabled={!editable("taxStreet")}
          />
        </Field>

        <PairedTextField
          label="Kota / Kode Pos"
          leftValue={form.city}
          rightValue={form.postalCode}
          onLeftChange={(value) => update("city", value)}
          onRightChange={(value) => update("postalCode", value)}
          leftPlaceholder="Kota"
          rightPlaceholder="Kode Pos"
          requiredLeft={isCreateMode}
          requiredRight={isCreateMode}
          disabled={!editable("city") && !editable("postalCode")}
        />

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

        <Field label="Region">
          <input
            type="text"
            className={inputClass}
            value={form.region || ""}
            onChange={(event) => update("region", event.target.value)}
            disabled={!editable("region")}
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

        <PairedTextField
          label="NPWP (VAT Reg. No.) / Tanggal Terdaftar"
          leftValue={form.npwp}
          rightValue={form.npwpregisteredDate}
          onLeftChange={(value) => update("npwp", value)}
          onRightChange={(value) => update("npwpregisteredDate", value)}
          leftPlaceholder="NPWP (VAT Reg. No.)"
          rightType="date"
          requiredLeft={isCreateMode}
          requiredRight={isCreateMode}
          disabled={!editable("npwp") && !editable("npwpregisteredDate")}
        />

        <ChoiceGroup
          label="Customer Class"
          options={CUSTOMER_CLASSES}
          value={form.customerClass}
          onChange={(value) => update("customerClass", value)}
          required={isCreateMode}
          disabled={!editable("customerClass")}
        />
      </Section>

      {/* 5. COMPANY CODE DATA */}
      <Section number="5" title="Company Code Data">
        {isAccounting ? (
          <Field label="Recon Account" required>
            <input
              type="text"
              className={inputClass}
              value={form.recontAccount || ""}
              onChange={(event) => update("recontAccount", event.target.value)}
              placeholder="Masukkan Recon Account"
              required
            />
          </Field>
        ) : (
          <ReadOnlyField label="Recon Account" value={form.recontAccount} />
        )}

        <ChoiceGroup
          label="Sort Key"
          options={SORT_KEYS}
          value={form.sortKey}
          onChange={(value) => update("sortKey", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Terms of Payment"
          options={TERMS_OF_PAYMENT}
          value={form.paymentTerms}
          onChange={(value) => update("paymentTerms", value)}
          required={isCreateMode}
          disabled={!editable("paymentTerms")}
        />

        <ChoiceGroup
          label="Tolerance Group"
          options={TOLERANCE_GROUPS}
          value={form.toleranceGroup}
          onChange={(value) => update("toleranceGroup", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Witholding Tax"
          options={WITHOLDING_TAX}
          value={form.witholdingTax}
          onChange={(value) => update("witholdingTax", value)}
          checkbox
          required={isTax}
          disabled={!isTax}
        />
      </Section>

      {/* 6. SALES AREA DATA */}
      <Section number="6" title="Sales Area Data">
        <ChoiceGroup
          label="Currency"
          options={CURRENCIES}
          value={form.currency}
          onChange={(value) => update("currency", value)}
          required={isCreateMode}
          disabled={!editable("currency")}
        />

        <ChoiceGroup
          label="Customer Pricing Procedure"
          options={CUSTOMER_PRICING_PROCEDURES}
          value={form.customerPricingProcedure}
          onChange={(value) => update("customerPricingProcedure", value)}
          checkbox
          required={isCreateMode}
          disabled={!editable("customerPricingProcedure")}
        />

        <ChoiceGroup
          label="Customer Statistic Group"
          options={CUSTOMER_STATISTIC_GROUPS}
          value={form.customerStatisticGroup}
          onChange={(value) => update("customerStatisticGroup", value)}
          checkbox
          required={isCreateMode}
          disabled={!editable("customerStatisticGroup")}
        />

        <ChoiceGroup
          label="Tax Classification"
          options={TAX_CLASSIFICATIONS}
          value={form.taxClassification}
          onChange={(value) => update("taxClassification", value)}
          required={isCreateMode}
          disabled={!editable("taxClassification")}
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
