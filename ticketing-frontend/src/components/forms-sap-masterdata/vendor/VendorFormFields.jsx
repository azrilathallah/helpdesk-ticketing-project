import { Trash2 } from "lucide-react";
import ChoiceGroup from "../ChoiceGroup";
import AttachmentField from "../AttachmentField";
import { Field, ReadOnlyField } from "../FormField";

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
  reconAccount: "",
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

/* =========================================================
   STYLE HELPERS
========================================================= */

const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

const requiredClass = "text-red-600";

function isEditable({ mode, readOnly, approvalRole, field }) {
  if (readOnly) return false;
  if (mode === "create") return true;
  if (mode === "submission") return false;
  if (mode !== "approval") return false;

  if (approvalRole === "accounting") {
    return ["accountGroup", "reconAccount", "paymentMethod"].includes(field);
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
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
          {number}
        </span>

        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="flex flex-col gap-3 p-3 sm:p-4">{children}</div>
    </section>
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
      <div className="mb-2.5 flex flex-wrap items-center justify-between">
        <label className={labelClass}>
          {label}
          {required && <span className={requiredClass}>*</span>}
        </label>

        {!disabled && (
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <span className="text-xs leading-none">+</span>
            Add Bank Account
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-200 border-collapse text-left text-sm">
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
                          ? "At least one bank account"
                          : "Delete"
                      }
                      aria-label={`Delete ${index + 1}`}
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
   VENDOR FORM
========================================================= */

export default function VendorFormFields({
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
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

  let sectionNumber = 0;

  const nextSection = () => {
    sectionNumber += 1;
    return sectionNumber;
  };

  return (
    <div className="space-y-5">
      {/* REQUEST TYPE */}
      <Section number={nextSection()} title="Request Type">
        <ChoiceGroup
          label="Request Type"
          groupKey="vendor_request_type"
          value={form.requestType}
          onChange={(value) => update("requestType", value)}
          required={isCreateMode}
          disabled={!editable("requestType")}
        />

        {isNewRequest && !isPIC ? (
          <ReadOnlyField label="Vendor Code" value={form.vendorCode || "-"} />
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
              required={isPIC || isCreateMode}
              disabled={!editable("vendorCode")}
            />
          </Field>
        )}
      </Section>

      {/* GENERAL DATA */}
      <Section number={nextSection()} title="General Data">
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

      {/* COMPANY CODE DATA — ACCOUNTING */}
      <Section
        number={nextSection()}
        title="Company Code Data (Accounting Dept)"
      >
        <ChoiceGroup
          label="Account Group"
          groupKey="vendor_account_group"
          value={form.accountGroup}
          onChange={(value) => update("accountGroup", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Recon Account"
          groupKey="vendor_recon_account"
          value={form.reconAccount}
          onChange={(value) => update("reconAccount", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Payment Method"
          groupKey="vendor_payment_method"
          value={form.paymentMethod}
          onChange={(value) => update("paymentMethod", value)}
          checkbox
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Witholding Tax Type & Code"
          groupKey="vendor_witholding_tax"
          value={form.witholdingTax}
          onChange={(value) => update("witholdingTax", value)}
          checkbox
          required={isTax}
          disabled={!isTax}
        />
      </Section>

      {/* COMPANY CODE DATA — PURCHASING */}
      <Section number={nextSection()} title="Company Code Data (Purch Dept)">
        <ChoiceGroup
          label="Company Code"
          groupKey="vendor_company_code"
          value={form.companyCode}
          onChange={(value) => update("companyCode", value)}
          required={isCreateMode}
          disabled={!editable("companyCode")}
        />

        <ChoiceGroup
          label="Due Date Payment"
          groupKey="vendor_due_date_payment"
          value={form.dueDatePayment}
          onChange={(value) => update("dueDatePayment", value)}
          required={isCreateMode}
          disabled={!editable("dueDatePayment")}
        />
      </Section>

      {/* PURCHASING ORGANIZATION DATA */}
      <Section number={nextSection()} title="Purchasing Organization Data">
        <ChoiceGroup
          label="Order Currency"
          groupKey="vendor_currency"
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

      {/* PAYMENT TRANSACTIONS */}
      <Section number={nextSection()} title="Payment Transactions">
        <PaymentTransactionsTable
          label="Bank Account Details"
          value={form.paymentTransactions}
          onChange={(value) => update("paymentTransactions", value)}
          required={isCreateMode}
          disabled={!editable("paymentTransactions")}
        />
      </Section>

      {/* ATTACHMENT */}
      <Section number={nextSection()} title="Attachment">
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
