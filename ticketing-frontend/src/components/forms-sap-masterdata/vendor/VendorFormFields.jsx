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
  otherCurrency: "",
  salesperson: "",
};

export const validateAttachments = (files) => {
  if (!files || files.length === 0) {
    return "";
  }

  const maxSize = 10 * 1024 * 1024;

  if (files.length === 1) {
    if (files[0].size > maxSize) {
      return "Ukuran file maksimal 10 MB.";
    }

    return "";
  }

  return "Jika mengunggah lebih dari 1 file, harap kompres menjadi satu file ZIP.";
};

function isEditable({ mode, readOnly, approvalRole, field }) {
  if (readOnly) {
    return false;
  }

  if (mode === "create") {
    return true;
  }

  if (mode === "submission") {
    return false;
  }

  if (mode !== "approval") {
    return false;
  }

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
   PRESENTATIONAL COMPONENTS
========================================================= */

export function Section({ number, title, children }) {
  return (
    <section className="customer-form__section">
      <div className="customer-form__section-title">
        <span>{number}</span>
        <h3>{title}</h3>
      </div>

      <div className="customer-form__section-body">{children}</div>
    </section>
  );
}

export function Field({ label, required = false, hint = "", children }) {
  return (
    <div className="customer-form__field">
      <label className="customer-form__label">
        {label}

        {required && <span className="customer-form__required"> *</span>}
      </label>

      {children}

      {hint && <small className="customer-form__hint">{hint}</small>}
    </div>
  );
}

export function ReadOnlyField({ label, value, hint = "", lockedBy = "" }) {
  return (
    <div className="customer-form__field">
      <label className="customer-form__label">{label}</label>

      <div className="customer-form__readonly-wrapper">
        <input
          type="text"
          className="customer-form__input customer-form__input--readonly"
          value={
            value !== undefined && value !== null && String(value).trim() !== ""
              ? value
              : "-"
          }
          readOnly
        />

        {lockedBy && (
          <span className="customer-form__locked-label">{lockedBy}</span>
        )}
      </div>

      {hint && <small className="customer-form__hint">{hint}</small>}
    </div>
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
        className={`customer-form__choices ${
          checkbox ? "customer-form__choices--checkbox" : ""
        } ${disabled ? "customer-form__choices--disabled" : ""}`}
      >
        {options.map(([code, name], index) => {
          const checked = checkbox
            ? Array.isArray(normalizedValue) && normalizedValue.includes(code)
            : normalizedValue === code;

          const inputRequired = checkbox
            ? required && !disabled && checkboxGroupEmpty && index === 0
            : required && !disabled;

          return (
            <label
              key={code}
              className={`customer-form__choice ${
                disabled ? "customer-form__choice--disabled" : ""
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
                  if (disabled || !onChange) {
                    return;
                  }

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
              />

              <span>
                <strong>{code}</strong>

                {name && ` ${name}`}
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
    <div className="customer-form__field">
      <label className="customer-form__label">
        {label}

        {(requiredLeft || requiredRight) && (
          <span className="customer-form__required"> *</span>
        )}
      </label>

      <div className="customer-form__two-column">
        <input
          type="text"
          className={`customer-form__input ${
            disabled ? "customer-form__input--readonly" : ""
          }`}
          value={leftValue || ""}
          onChange={(event) => onLeftChange?.(event.target.value)}
          placeholder={leftPlaceholder}
          required={requiredLeft && !disabled}
          disabled={disabled}
        />

        <span className="customer-form__separator">{separator}</span>

        <input
          type={rightType}
          className={`customer-form__input ${
            disabled ? "customer-form__input--readonly" : ""
          }`}
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

export function LockedBox({ title, note = "", children }) {
  return (
    <div className="customer-form__locked-box">
      <div className="customer-form__locked-header">
        <strong>{title}</strong>

        {note && <span>{note}</span>}
      </div>

      {children}
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
    if (disabled) {
      return;
    }

    const selected = Array.from(event.target.files || []);

    onChange?.(selected);
  };

  const handleRemove = (index) => {
    if (disabled) {
      return;
    }

    onChange?.(files.filter((_, fileIndex) => fileIndex !== index));
  };

  const formatSize = (bytes) => {
    if (!bytes) {
      return "File";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="customer-form__field">
      <label className="customer-form__label">{label}</label>

      {!disabled && (
        <div className="customer-form__attachment">
          <label className="customer-form__attachment-dropzone">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="customer-form__attachment-input"
            />

            <span className="customer-form__attachment-text">
              Klik untuk unggah file
            </span>

            <small className="customer-form__attachment-hint">
              Upload 1 file (PDF, Excel, Word, Gambar) - atau beberapa file
              dalam 1 ZIP. Maks. 10 MB.
            </small>
          </label>

          {files.length > 0 && (
            <ul className="customer-form__attachment-list">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="customer-form__attachment-item"
                >
                  <span className="customer-form__attachment-name">
                    {file.name}
                  </span>

                  <span className="customer-form__attachment-size">
                    {formatSize(file.size)}
                  </span>

                  <button
                    type="button"
                    className="customer-form__attachment-remove"
                    onClick={() => handleRemove(index)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <small className="customer-form__error">{error}</small>}
        </div>
      )}

      {disabled && existingFiles.length > 0 && (
        <div className="approval-attachments">
          {existingFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="approval-attachment">
              <span>📎</span>

              <div>
                <strong>{file.name}</strong>

                <small>
                  {file.size ? formatSize(file.size) : file.type || "File"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      {disabled && existingFiles.length === 0 && (
        <div className="customer-form__attachment-readonly">
          <span className="customer-form__attachment-readonly-icon">📎</span>

          <div>
            <strong>Attachment</strong>

            <p>Tidak ada attachment yang diunggah.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN SHARED FORM
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
    <>
      {/* =====================================================
          1. REQUEST TYPE
      ===================================================== */}

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
            <Field label="Vendor Code" required>
              <input
                type="text"
                className="customer-form__input"
                value={form.vendorCode || ""}
                onChange={(event) => {
                  const value = event.target.value;

                  update("vendorCode", value);

                  onVendorCodeChange?.(value);
                }}
                placeholder="Masukkan vendor code"
                required
              />
            </Field>
          ) : (
            <ReadOnlyField label="Vendor Code" value={form.vendorCode || "-"} />
          )
        ) : (
          <Field label="Vendor Code" required={isCreateMode}>
            <input
              type="text"
              className="customer-form__input"
              value={form.vendorCode || ""}
              onChange={(event) => update("vendorCode", event.target.value)}
              placeholder="Masukkan vendor code"
              required={isCreateMode}
              disabled={!editable("vendorCode")}
            />
          </Field>
        )}
      </Section>

      {/* =====================================================
          2. GENERAL DATA
      ===================================================== */}

      <Section number="2" title="General Data">
        <Field label="Name" required={isCreateMode}>
          <input
            type="text"
            className="customer-form__input"
            value={form.name || ""}
            onChange={(event) => update("name", event.target.value)}
            required={isCreateMode}
            disabled={!editable("name")}
          />
        </Field>

        <Field label="Search Term">
          <input
            type="text"
            className="customer-form__input"
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
            className="customer-form__input"
            value={form.streetAddress || ""}
            onChange={(event) => update("streetAddress", event.target.value)}
            required={isCreateMode}
            disabled={!editable("streetAddress")}
          />
        </Field>

        <Field label="City" required={isCreateMode}>
          <input
            type="text"
            className="customer-form__input"
            value={form.city || ""}
            onChange={(event) => update("city", event.target.value)}
            required={isCreateMode}
            disabled={!editable("city")}
          />
        </Field>

        <Field label="Postal Code" required={isCreateMode}>
          <input
            type="text"
            className="customer-form__input"
            value={form.postalCode || ""}
            onChange={(event) => update("postalCode", event.target.value)}
            required={isCreateMode}
            disabled={!editable("postalCode")}
          />
        </Field>

        <Field label="Country" required={isCreateMode}>
          <input
            type="text"
            className="customer-form__input"
            value={form.country || ""}
            onChange={(event) => update("country", event.target.value)}
            required={isCreateMode}
            disabled={!editable("country")}
          />
        </Field>

        <Field label="Telephone">
          <input
            type="text"
            className="customer-form__input"
            value={form.telephone || ""}
            onChange={(event) => update("telephone", event.target.value)}
            disabled={!editable("telephone")}
          />
        </Field>

        <Field label="Fax">
          <input
            type="text"
            className="customer-form__input"
            value={form.fax || ""}
            onChange={(event) => update("fax", event.target.value)}
            disabled={!editable("fax")}
          />
        </Field>

        <Field label="Contact Person">
          <input
            type="text"
            className="customer-form__input"
            value={form.contactPerson || ""}
            onChange={(event) => update("contactPerson", event.target.value)}
            disabled={!editable("contactPerson")}
          />
        </Field>

        <Field label="NPWP">
          <input
            type="text"
            className="customer-form__input"
            value={form.npwp || ""}
            onChange={(event) => update("npwp", event.target.value)}
            disabled={!editable("npwp")}
          />
        </Field>

        <Field label="Email" required={isCreateMode}>
          <input
            type="text"
            className="customer-form__input"
            value={form.email || ""}
            onChange={(event) => update("email", event.target.value)}
            required={isCreateMode}
            disabled={!editable("email")}
          />
        </Field>

        <Field label="Business Type">
          <input
            type="text"
            className="customer-form__input"
            value={form.businessType || ""}
            onChange={(event) => update("businessType", event.target.value)}
            disabled={!editable("businessType")}
          />
        </Field>
      </Section>

      {/* =====================================================
          3. COMPANY CODE DATA (ACCOUNTING DEPT)
      ===================================================== */}

      <Section number="3" title="Company Code Data (Accounting Dept)">
        {isAccounting ? (
          <ChoiceGroup
            label="Account Group"
            options={ACCOUNT_GROUPS}
            value={form.accountGroup}
            onChange={(value) => update("accountGroup", value)}
            required
          />
        ) : (
          <ChoiceGroup
            label="Account Group"
            options={ACCOUNT_GROUPS}
            value={form.accountGroup}
            disabled
          />
        )}

        {isAccounting ? (
          <ChoiceGroup
            label="Recon Account"
            options={RECON_ACCOUNTS}
            value={form.recontAccount}
            onChange={(value) => update("recontAccount", value)}
            required
          />
        ) : (
          <ChoiceGroup
            label="Recon Account"
            options={RECON_ACCOUNTS}
            value={form.recontAccount}
            disabled
          />
        )}

        {isAccounting ? (
          <ChoiceGroup
            label="Payment Method"
            options={PAYMENT_METHODS}
            value={form.paymentMethod}
            onChange={(value) => update("paymentMethod", value)}
            checkbox
            required
          />
        ) : (
          <ChoiceGroup
            label="Payment Method"
            options={PAYMENT_METHODS}
            value={form.paymentMethod}
            checkbox
            disabled
          />
        )}

        {isTax ? (
          <ChoiceGroup
            label="Witholding Tax Type & Code"
            options={WITHOLDING_TAX}
            value={form.witholdingTax}
            onChange={(value) => update("witholdingTax", value)}
            checkbox
            required
          />
        ) : (
          <ChoiceGroup
            label="Witholding Tax Type & Code"
            options={WITHOLDING_TAX}
            value={form.witholdingTax}
            checkbox
            disabled
          />
        )}
      </Section>

      {/* =====================================================
          4. COMPANY CODE DATA (PURCH DEPT)
      ===================================================== */}

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

      {/* =====================================================
          5. Purchasing Organization Data
      ===================================================== */}

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
            className="customer-form__input"
            value={form.salesperson || ""}
            onChange={(event) => update("salesperson", event.target.value)}
            disabled={!editable("salesperson")}
          />
        </Field>
      </Section>

      {/* =====================================================
          6. ATTACHMENT
      ===================================================== */}

      <Section number="6" title="Attachment">
        <AttachmentField
          files={attachments}
          existingFiles={existingAttachments}
          onChange={setAttachments}
          disabled={!isCreateMode || readOnly}
          error={form.attachmentError}
        />
      </Section>
    </>
  );
}
