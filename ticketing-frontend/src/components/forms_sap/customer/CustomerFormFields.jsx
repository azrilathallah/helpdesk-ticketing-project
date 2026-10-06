import React from "react";

/* =========================================================
   CONSTANTS
========================================================= */

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
  ["P4", "PPh4(2) - Customer Payment Deduction"],
  ["P5", "PPh23 - Customer Payment Deduction"],
];

export const CURRENCIES = ["IDR", "USD", "Other"];

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
  searchTerm1: "",
  invoiceStreet: "",
  taxStreet: "",
  city: "",
  postalCode: "",
  country: "",
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
  otherCurrency: "",
  customerPricingProcedure: ["1"],
  customerStatisticGroup: ["1"],
  taxClassification: "",
};

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   MODE HELPERS
========================================================= */

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

  return (
    <Field label={label} required={required}>
      <div
        className={`customer-form__choices ${
          checkbox ? "customer-form__choices--checkbox" : ""
        } ${disabled ? "customer-form__choices--disabled" : ""}`}
      >
        {options.map(([code, name]) => {
          const checked = checkbox
            ? Array.isArray(normalizedValue) && normalizedValue.includes(code)
            : normalizedValue === code;

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
                required={required && !disabled && !checkbox}
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

                {name && ` - ${name}`}
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
              Klik untuk memilih file
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
            <Field
              label="Customer Code"
              required
              hint="Customer code wajib diisi oleh PIC untuk request New."
            >
              <input
                type="text"
                className="customer-form__input"
                value={form.customerCode || ""}
                onChange={(event) => {
                  const value = event.target.value;

                  update("customerCode", value);

                  onCustomerCodeChange?.(value);
                }}
                placeholder="Input customer code (PIC)"
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
              className="customer-form__input"
              value={form.customerCode || ""}
              onChange={(event) => update("customerCode", event.target.value)}
              placeholder="Masukkan customer code"
              required={isCreateMode}
              disabled={!editable("customerCode")}
            />
          </Field>
        )}
      </Section>

      {/* =====================================================
          2. REQUESTOR
      ===================================================== */}

      <Section number="2" title="Requestor">
        <ReadOnlyField label="Name" value={requestor.name} />

        <ReadOnlyField label="Position (Jabatan)" value={requestor.position} />

        <div className="customer-form__field">
          <label className="customer-form__label">Division / Department</label>

          <div className="customer-form__two-column">
            <input
              type="text"
              className="customer-form__input customer-form__input--readonly"
              value={requestor.division || "-"}
              readOnly
            />

            <span className="customer-form__separator">/</span>

            <input
              type="text"
              className="customer-form__input customer-form__input--readonly"
              value={requestor.department || "-"}
              readOnly
            />
          </div>
        </div>

        <ReadOnlyField label="Telephone" value={requestor.telephone} />

        <ReadOnlyField label="Email" value={requestor.email} />
      </Section>

      {/* =====================================================
          3. INITIAL SCREEN
      ===================================================== */}

      <Section number="3" title="Initial Screen">
        {isAccounting ? (
          <ChoiceGroup
            label="Account Group"
            options={ACCOUNT_GROUPS}
            value={form.accountGroup}
            onChange={(value) => update("accountGroup", value)}
            required
          />
        ) : (
          <Field label="Account Group">
            <LockedBox title="Filled by Accounting">
              <ChoiceGroup
                options={ACCOUNT_GROUPS}
                value={form.accountGroup}
                disabled
              />
            </LockedBox>
          </Field>
        )}

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

        <ReadOnlyField label="Customer Code" value={form.customerCode || "-"} />
      </Section>

      {/* =====================================================
          4. GENERAL DATA
      ===================================================== */}

      <Section number="4" title="General Data">
        <Field label="Judul (Title)" required={isCreateMode}>
          <input
            type="text"
            className="customer-form__input"
            value={form.title || ""}
            onChange={(event) => update("title", event.target.value)}
            required={isCreateMode}
            disabled={!editable("title")}
          />
        </Field>

        <Field label="Nama Pelanggan (Name)" required={isCreateMode}>
          <input
            type="text"
            className="customer-form__input"
            value={form.customerName || ""}
            onChange={(event) => update("customerName", event.target.value)}
            required={isCreateMode}
            disabled={!editable("customerName")}
          />
        </Field>

        <Field label="Search Term 1">
          <input
            type="text"
            className="customer-form__input"
            value={form.searchTerm1 || ""}
            onChange={(event) => update("searchTerm1", event.target.value)}
            disabled={!editable("searchTerm1")}
          />
        </Field>

        <Field
          label="Alamat Invoice (Street / House Number)"
          required={isCreateMode}
        >
          <input
            type="text"
            className="customer-form__input"
            value={form.invoiceStreet || ""}
            onChange={(event) => update("invoiceStreet", event.target.value)}
            required={isCreateMode}
            disabled={!editable("invoiceStreet")}
          />
        </Field>

        <Field label="Alamat Pajak" required={isCreateMode}>
          <input
            type="text"
            className="customer-form__input"
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
            className="customer-form__input"
            value={form.country || ""}
            onChange={(event) => update("country", event.target.value)}
            required={isCreateMode}
            disabled={!editable("country")}
          />
        </Field>

        <Field label="Region">
          <input
            type="text"
            className="customer-form__input"
            value={form.region || ""}
            onChange={(event) => update("region", event.target.value)}
            disabled={!editable("region")}
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

      {/* =====================================================
          5. COMPANY CODE DATA
      ===================================================== */}

      <Section number="5" title="Company Code Data">
        {isAccounting ? (
          <Field label="Recon Account" required hint="Diisi oleh Accounting">
            <input
              type="text"
              className="customer-form__input"
              value={form.recontAccount || ""}
              onChange={(event) => update("recontAccount", event.target.value)}
              placeholder="Masukkan Recon Account"
              required
            />
          </Field>
        ) : (
          <ReadOnlyField
            label="Recon Account"
            value={form.recontAccount}
            lockedBy="Filled by Accounting"
          />
        )}

        {isAccounting ? (
          <ChoiceGroup
            label="Sort Key"
            options={SORT_KEYS}
            value={form.sortKey}
            onChange={(value) => update("sortKey", value)}
            required
          />
        ) : (
          <Field label="Sort Key">
            <LockedBox title="Filled by Accounting">
              <ChoiceGroup options={SORT_KEYS} value={form.sortKey} disabled />
            </LockedBox>
          </Field>
        )}

        <ChoiceGroup
          label="Terms of Payment"
          options={TERMS_OF_PAYMENT}
          value={form.paymentTerms}
          onChange={(value) => update("paymentTerms", value)}
          required={isCreateMode}
          disabled={!editable("paymentTerms")}
        />

        {isAccounting ? (
          <ChoiceGroup
            label="Tolerance Group"
            options={TOLERANCE_GROUPS}
            value={form.toleranceGroup}
            onChange={(value) => update("toleranceGroup", value)}
            required
          />
        ) : (
          <Field label="Tolerance Group">
            <LockedBox title="Filled by Accounting">
              <ChoiceGroup
                options={TOLERANCE_GROUPS}
                value={form.toleranceGroup}
                disabled
              />
            </LockedBox>
          </Field>
        )}

        {isTax ? (
          <ChoiceGroup
            label="Witholding Tax"
            options={WITHOLDING_TAX}
            value={form.witholdingTax}
            onChange={(value) => update("witholdingTax", value)}
            checkbox
            required
          />
        ) : (
          <Field label="Witholding Tax">
            <LockedBox title="Filled by Tax">
              <ChoiceGroup
                options={WITHOLDING_TAX}
                value={form.witholdingTax}
                checkbox
                disabled
              />
            </LockedBox>
          </Field>
        )}
      </Section>

      {/* =====================================================
          6. SALES AREA DATA
      ===================================================== */}

      <Section number="6" title="Sales Area Data">
        <Field label="Currency" required={isCreateMode}>
          <div className="customer-form__choices">
            {CURRENCIES.map((currency) => (
              <label
                key={currency}
                className={`customer-form__choice ${
                  !editable("currency") ? "customer-form__choice--disabled" : ""
                }`}
              >
                <input
                  type="radio"
                  name="currency"
                  value={currency}
                  checked={form.currency === currency}
                  onChange={(event) => update("currency", event.target.value)}
                  required={isCreateMode}
                  disabled={!editable("currency")}
                />

                <span>{currency}</span>
              </label>
            ))}
          </div>

          {form.currency === "Other" && (
            <div className="customer-form__nested-field">
              <label className="customer-form__nested-label">
                Other Currency
              </label>

              <input
                type="text"
                className={`customer-form__input ${
                  !editable("otherCurrency")
                    ? "customer-form__input--readonly"
                    : ""
                }`}
                value={form.otherCurrency || ""}
                onChange={(event) =>
                  update("otherCurrency", event.target.value)
                }
                required={isCreateMode}
                disabled={!editable("otherCurrency")}
              />
            </div>
          )}
        </Field>

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

      {/* =====================================================
          7. ATTACHMENT
      ===================================================== */}

      <Section number="7" title="Attachment">
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
