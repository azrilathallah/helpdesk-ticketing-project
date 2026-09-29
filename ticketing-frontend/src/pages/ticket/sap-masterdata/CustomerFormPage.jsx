import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

/* =========================================================
   CONSTANTS
========================================================= */

const REQUEST_TYPES = [["New"], ["Change"], ["Extend"], ["Block / Unblock"]];

const ACCOUNT_GROUPS = [
  ["Z010", "Customer-Tenant"],
  ["Z020", "Customer-Non Tenant"],
  ["Z030", "Customer-Advertising Agency"],
  ["Z040", "Customer-Affiliated"],
  ["Z050", "Customer-Shareholder"],
  ["Z060", "Customer-Building Owner"],
  ["Z070", "Customer-OneTime"],
];

const COMPANY_CODES = [
  ["1100", "IBST"],
  ["1200", "IBSW"],
];

const DISTRIBUTION_CHANNELS = [["00", "Common"]];
const DIVISIONS = [["00", "Common"]];

const CUSTOMER_CLASSES = [
  ["01", "Standard"],
  ["03", "Government (WAPU)"],
];

const TERMS_OF_PAYMENT = [
  ["AR00", "Payable immediately Due net"],
  ["AR01", "Due in 14 days"],
  ["AR02", "Due in 30 days"],
  ["AR03", "Due in 60 days"],
  ["AR04", "Due in 365 days"],
  ["AR05", "Due in 2 years"],
];

const SORT_KEYS = [
  ["002", "Document No., Fiscal Year"],
  ["022", "One Time Name/City"],
];

const TOLERANCE_GROUPS = [
  ["1100", "Cust/Vend Tolerance"],
  ["1200", "Cust/Vend Tolerance"],
];

const WITHOLDING_TAX = [
  ["P4", "PPh4(2) - Customer Payment Deduction"],
  ["P5", "PPh23 - Customer Payment Deduction"],
];

const CURRENCIES = ["IDR", "USD", "Other"];

const CUSTOMER_PRICING_PROCEDURES = [["Standard"]];
const CUSTOMER_STATISTIC_GROUPS = [["Standard"]];

const TAX_CLASSIFICATIONS = [
  ["0", "No Tax"],
  ["1", "Tax"],
  ["2", "WAPU"],
];

/* =========================================================
   HELPERS
========================================================= */

const getUserValue = (user, keys) => {
  for (const key of keys) {
    const value = user?.[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }

  return "-";
};

/**
 * Validasi aturan attachment:
 * - Boleh 1 file (format bebas: pdf, xlsx, docx, jpg, png)
 * - Jika > 1 file, HARUS berupa satu file ZIP
 */
const validateAttachments = (files) => {
  if (!files || files.length === 0) return ""; // tidak wajib

  if (files.length === 1) {
    const file = files[0];
    const isZip = file.name.toLowerCase().endsWith(".zip");
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return "Ukuran file maksimal 10 MB.";
    }
    return "";
  }

  // Lebih dari 1 file → wajib ZIP tunggal
  if (files.length > 1) {
    const allZip = files.every((f) => f.name.toLowerCase().endsWith(".zip"));
    if (!allZip || files.length > 1) {
      return "Jika mengunggah lebih dari 1 file, harap kompres menjadi satu file ZIP.";
    }
  }

  return "";
};

/* =========================================================
   PRESENTATIONAL COMPONENTS
========================================================= */

function Section({ number, title, children }) {
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

function Field({ label, required = false, hint = "", children }) {
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

function ReadOnlyField({ label, value, hint = "", lockedBy = "" }) {
  return (
    <div className="customer-form__field">
      <label className="customer-form__label">{label}</label>

      <div className="customer-form__readonly-wrapper">
        <input
          type="text"
          className="customer-form__input customer-form__input--readonly"
          value={value || "-"}
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

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  checkbox = false,
  disabled = false,
}) {
  return (
    <Field label={label}>
      <div
        className={`customer-form__choices ${
          checkbox ? "customer-form__choices--checkbox" : ""
        } ${disabled ? "customer-form__choices--disabled" : ""}`}
      >
        {options.map(([code, name]) => {
          const checked = checkbox ? value.includes(code) : value === code;

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
                onChange={(e) => {
                  if (disabled) return;

                  if (!checkbox) {
                    onChange(e.target.value);
                    return;
                  }

                  onChange(
                    e.target.checked
                      ? [...value, e.target.value]
                      : value.filter((item) => item !== e.target.value),
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

/**
 * Dua input teks dalam satu baris yang dipisahkan separator.
 */
function PairedTextField({
  label,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  leftPlaceholder = "",
  rightPlaceholder = "",
  rightType = "text",
  separator = "/",
}) {
  return (
    <div className="customer-form__field">
      <label className="customer-form__label">{label}</label>

      <div className="customer-form__two-column">
        <input
          type="text"
          className="customer-form__input"
          value={leftValue}
          onChange={(e) => onLeftChange(e.target.value)}
          placeholder={leftPlaceholder}
        />

        <span className="customer-form__separator">{separator}</span>

        <input
          type={rightType}
          className="customer-form__input"
          value={rightValue}
          onChange={(e) => onRightChange(e.target.value)}
          placeholder={rightPlaceholder}
        />
      </div>
    </div>
  );
}

/**
 * Kotak terkunci "Filled by ..." dengan konten di dalamnya.
 */
function LockedBox({ title, note = "", children }) {
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

/**
 * Komponen upload attachment.
 * - 1 file: format bebas
 * - >1 file: wajib ZIP (ditangani di validasi)
 */
function AttachmentField({ label, files, onChange, error = "" }) {
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    onChange(selected);
  };

  const handleRemove = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="customer-form__field">
      <label className="customer-form__label">{label}</label>

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
            Upload 1 file (PDF, Excel, Word, Gambar) - atau beberapa file dalam
            1 ZIP. Maks. 10 MB.
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
                  aria-label={`Hapus ${file.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <small className="customer-form__error">{error}</small>}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /*
   * Requestor berasal dari user yang sedang login.
   * Jika backend/HRIS mengembalikan field name, position,
   * department, phone, email — field tersebut otomatis dipakai.
   */
  const requestor = useMemo(
    () => ({
      name: getUserValue(user, ["name", "nama", "full_name", "fullname"]),
      position: getUserValue(user, ["position", "jabatan", "job_title"]),
      department: getUserValue(user, [
        "department",
        "division",
        "divisi",
        "departemen",
      ]),
      telephone: getUserValue(user, ["phone", "telephone", "telp"]),
      email: getUserValue(user, ["email"]),
    }),
    [user],
  );

  const [form, setForm] = useState({
    requestType: "",
    customerCode: "",

    accountGroup: "",
    companyCode: "",
    salesOrganization: "",
    distributionChannel: [],
    division: [],

    title: "",
    customerName: "",
    searchTerm1: "",
    invoiceStreet: "",
    invoiceStreet2: "",
    taxStreet4: "",
    taxStreet5: "",
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

    currency: "",
    otherCurrency: "",
    customerPricingProcedure: [],
    customerStatisticGroup: [],
    taxClassification: "",

    attachments: [],
    attachmentError: "",
  });

  const [submitMode, setSubmitMode] = useState(""); // "draft" | "submit"

  const handleAttachmentChange = (files) => {
    const error = validateAttachments(files);
    setForm((prev) => ({
      ...prev,
      attachments: files,
      attachmentError: error,
    }));
  };

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (mode) => (e) => {
    e.preventDefault();

    // Validasi attachment
    const attachmentError = validateAttachments(form.attachments);
    if (attachmentError) {
      setForm((prev) => ({ ...prev, attachmentError }));
      alert(attachmentError);
      return;
    }

    // Validasi wajib untuk mode "submit" (bukan draft)
    if (mode === "submit") {
      if (!form.requestType) {
        alert("Request Type wajib dipilih.");
        return;
      }
      if (form.requestType !== "New" && !form.customerCode) {
        alert("Customer Code wajib diisi.");
        return;
      }
      if (!form.customerName) {
        alert("Nama Pelanggan wajib diisi.");
        return;
      }
    }

    const payload = {
      ...form,
      requestor,
      status: mode === "draft" ? "DRAFT" : "SUBMITTED",
      submittedAt: new Date().toISOString(),
      // attachments: idealnya dikirim sebagai FormData ke backend
      attachments: form.attachments.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    };

    console.log(`Customer Master Data (${mode}):`, payload);

    alert(
      mode === "draft"
        ? "Form Customer berhasil disimpan sebagai Draft."
        : "Form Customer berhasil disubmit.\n\nData belum dikirim ke backend.",
    );

    setSubmitMode(mode);
  };

  const isNewRequest = form.requestType === "New";

  return (
    <div className="customer-form-page">
      <div className="customer-form-card">
        {/* HEADER */}
        <header className="customer-form__header">
          <button
            type="button"
            className="customer-form__back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div>
            <p className="customer-form__eyebrow">
              SAP · Master Data · Customer
            </p>
            <h1>Master Data Customer Request</h1>
          </div>
        </header>

        <form className="customer-form" onSubmit={(e) => e.preventDefault()}>
          {/* 1. REQUEST TYPE */}
          <Section number="1" title="Request Type">
            <ChoiceGroup
              label="Request Type"
              options={REQUEST_TYPES}
              value={form.requestType}
              onChange={(value) => update("requestType", value)}
            />

            {isNewRequest ? (
              <ReadOnlyField label="Customer Code" value="-" />
            ) : (
              <Field label="Customer Code" required>
                <input
                  type="text"
                  className="customer-form__input"
                  value={form.customerCode}
                  onChange={(e) => update("customerCode", e.target.value)}
                  placeholder="Masukkan customer code"
                  required
                />
              </Field>
            )}
          </Section>

          {/* 2. REQUESTOR */}
          <Section number="2" title="Requestor">
            <ReadOnlyField label="Name" value={requestor.name} />
            <ReadOnlyField
              label="Position (Jabatan)"
              value={requestor.position}
            />

            <div className="customer-form__field">
              <label className="customer-form__label">
                Division / Department
              </label>

              <div className="customer-form__two-column">
                <input
                  type="text"
                  className="customer-form__input customer-form__input--readonly"
                  value={getUserValue(user, ["division", "divisi"])}
                  readOnly
                />

                <span className="customer-form__separator">/</span>

                <input
                  type="text"
                  className="customer-form__input customer-form__input--readonly"
                  value={getUserValue(user, ["department", "departemen"])}
                  readOnly
                />
              </div>
            </div>

            <ReadOnlyField label="Telephone" value={requestor.telephone} />
            <ReadOnlyField label="Email" value={requestor.email} />
          </Section>

          {/* 3. INITIAL SCREEN */}
          <Section number="3" title="Initial Screen">
            <Field label="Account Group">
              <LockedBox title="Filled by Accounting">
                <ChoiceGroup
                  options={ACCOUNT_GROUPS}
                  value={form.accountGroup}
                  onChange={(value) => update("accountGroup", value)}
                  disabled
                />
              </LockedBox>
            </Field>

            <ChoiceGroup
              label="Company Code"
              options={COMPANY_CODES}
              value={form.companyCode}
              onChange={(value) => update("companyCode", value)}
            />

            <ChoiceGroup
              label="Sales Organization"
              options={COMPANY_CODES}
              value={form.salesOrganization}
              onChange={(value) => update("salesOrganization", value)}
            />

            <ChoiceGroup
              label="Distribution Channel"
              options={DISTRIBUTION_CHANNELS}
              value={form.distributionChannel}
              onChange={(value) => update("distributionChannel", value)}
              checkbox
            />

            <ChoiceGroup
              label="Division"
              options={DIVISIONS}
              value={form.division}
              onChange={(value) => update("division", value)}
              checkbox
            />

            <ReadOnlyField
              label="Customer Code"
              value={form.customerCode || "-"}
            />
          </Section>

          {/* 4. GENERAL DATA */}
          <Section number="4" title="General Data">
            <Field label="Judul (Title)">
              <input
                type="text"
                className="customer-form__input"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>

            <Field label="Nama Pelanggan (Name)" required>
              <input
                type="text"
                className="customer-form__input"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                required
              />
            </Field>

            <Field label="Search Term 1">
              <input
                type="text"
                className="customer-form__input"
                value={form.searchTerm1}
                onChange={(e) => update("searchTerm1", e.target.value)}
                required
              />
            </Field>

            <Field label="Alamat Invoice (Street / House Number)">
              <input
                type="text"
                className="customer-form__input"
                value={form.invoiceStreet}
                onChange={(e) => update("invoiceStreet", e.target.value)}
              />
            </Field>

            <Field label="Alamat Invoice (Street 2)">
              <input
                type="text"
                className="customer-form__input"
                value={form.invoiceStreet2}
                onChange={(e) => update("invoiceStreet2", e.target.value)}
              />
            </Field>

            <Field label="Alamat Pajak (Street 4)">
              <input
                type="text"
                className="customer-form__input"
                value={form.taxStreet4}
                onChange={(e) => update("taxStreet4", e.target.value)}
              />
            </Field>

            <Field label="Alamat Pajak (Street 5)">
              <input
                type="text"
                className="customer-form__input"
                value={form.taxStreet5}
                onChange={(e) => update("taxStreet5", e.target.value)}
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
            />

            <Field label="Country">
              <input
                type="text"
                className="customer-form__input"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
            </Field>

            <Field label="Region">
              <input
                type="text"
                className="customer-form__input"
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
              />
            </Field>

            <Field label="Telephone">
              <input
                type="text"
                className="customer-form__input"
                value={form.telephone}
                onChange={(e) => update("telephone", e.target.value)}
              />
            </Field>

            <Field label="Fax">
              <input
                type="text"
                className="customer-form__input"
                value={form.fax}
                onChange={(e) => update("fax", e.target.value)}
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
            />

            <ChoiceGroup
              label="Customer Class"
              options={CUSTOMER_CLASSES}
              value={form.customerClass}
              onChange={(value) => update("customerClass", value)}
            />
          </Section>

          {/* 5. COMPANY CODE DATA */}
          <Section number="5" title="Company Code Data">
            <ReadOnlyField
              label="Recon Account"
              value={form.recontAccount}
              lockedBy="Filled by Accounting"
            />

            {/* SORT KEY — Filled by Accounting */}
            <Field label="Sort Key">
              <LockedBox title="Filled by Accounting">
                <ChoiceGroup
                  options={SORT_KEYS}
                  value={form.sortKey}
                  onChange={(value) => update("sortKey", value)}
                  disabled
                />
              </LockedBox>
            </Field>

            <ChoiceGroup
              label="Terms of Payment"
              options={TERMS_OF_PAYMENT}
              value={form.paymentTerms}
              onChange={(value) => update("paymentTerms", value)}
            />

            {/* TOLERANCE GROUP — Filled by Accounting */}
            <Field label="Tolerance Group">
              <LockedBox title="Filled by Accounting">
                <ChoiceGroup
                  options={TOLERANCE_GROUPS}
                  value={form.toleranceGroup}
                  onChange={(value) => update("toleranceGroup", value)}
                  disabled
                />
              </LockedBox>
            </Field>

            {/* WITHOLDING TAX — Filled by Tax */}
            <Field label="Witholding Tax">
              <LockedBox title="Filled by Tax">
                <ChoiceGroup
                  options={WITHOLDING_TAX}
                  value={form.witholdingTax}
                  onChange={(value) => update("witholdingTax", value)}
                  checkbox
                  disabled
                />
              </LockedBox>
            </Field>
          </Section>

          {/* 6. SALES AREA DATA */}
          <Section number="6" title="Sales Area Data">
            <Field label="Currency">
              <div className="customer-form__choices">
                {CURRENCIES.map((currency) => (
                  <label key={currency} className="customer-form__choice">
                    <input
                      type="radio"
                      name="currency"
                      value={currency}
                      checked={form.currency === currency}
                      onChange={(e) => update("currency", e.target.value)}
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
                    className="customer-form__input"
                    value={form.otherCurrency}
                    onChange={(e) => update("otherCurrency", e.target.value)}
                    placeholder="Masukkan currency"
                    required
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
            />

            <ChoiceGroup
              label="Customer Statistic Group"
              options={CUSTOMER_STATISTIC_GROUPS}
              value={form.customerStatisticGroup}
              onChange={(value) => update("customerStatisticGroup", value)}
              checkbox
            />

            <ChoiceGroup
              label="Tax Classification"
              options={TAX_CLASSIFICATIONS}
              value={form.taxClassification}
              onChange={(value) => update("taxClassification", value)}
            />
          </Section>

          {/* 7. ATTACHMENT */}
          <Section number="7" title="Attachment">
            <AttachmentField
              files={form.attachments}
              onChange={handleAttachmentChange}
              error={form.attachmentError}
            />
          </Section>

          {/* ACTIONS */}
          <div className="customer-form__actions">
            <button
              type="button"
              className="customer-form__button customer-form__button--secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="customer-form__button customer-form__button--draft"
              onClick={handleSubmit("draft")}
            >
              Save as Draft
            </button>

            <button
              type="button"
              className="customer-form__button customer-form__button--primary"
              onClick={handleSubmit("submit")}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
