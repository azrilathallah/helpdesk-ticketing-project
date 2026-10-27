import { Trash2 } from "lucide-react";
import ChoiceGroup from "../ChoiceGroup";
import AttachmentField from "../AttachmentField";
import { Field, ReadOnlyField } from "../FormField";

export const DEFAULT_GL_FORM = {
  companyCode: "IBSW",
  requestType: "Create",
  purposeOfUse: "",
  accountGroup: "",
  glAccount: [
    {
      gl: "",
      shortText: "",
      longText: "",
    },
  ],

  accountCurrency: "",
  onlyBalancesLocalCurrency: "",
  taxCategory: "",
  postingWithoutTax: "",
  reconAcctForAcctType: "",
  openItemManagement: "",
  lineItemDisplay: "",
  sortKey: "",
  fieldStatusGroup: "",
  postingAutomaticallyOnly: "",

  bankCountry: "",
  bankKey: "",
  bankName: "",
  bankAccountNumber: "",
  currency: "",

  costElementGroup: "",
};

/* =========================================================
   STYLE HELPERS
========================================================= */

const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const readOnlyInputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs text-slate-500 cursor-not-allowed outline-none";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

const requiredClass = "text-red-600";

function isEditable({ mode, readOnly, approvalRole, field }) {
  if (readOnly) return false;
  if (mode === "create") return true;
  if (mode === "submission") return false;
  if (mode !== "approval") return false;

  //   if (approvalRole === "accounting") {
  //     return ["reconAccount", "glAccount"].includes(field);
  //   }

  //   if (approvalRole === "pic") {
  //     return field === "materialCode";
  //   }

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
   GL ACCOUNT BANK DATA TABLE
========================================================= */

const EMPTY_GL_ACCOUNT = {
  gl: "",
  shortText: "",
  longText: "",
};

export function GLAccountTable({
  label,
  value = [],
  onChange,
  disabled = false,
  required = false,
}) {
  const rows =
    Array.isArray(value) && value.length > 0
      ? value
      : [{ ...EMPTY_GL_ACCOUNT }];

  const updateRow = (index, field, newValue) => {
    const updatedRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: newValue } : row,
    );

    onChange?.(updatedRows);
  };

  const addRow = () => {
    onChange?.([...rows, { ...EMPTY_GL_ACCOUNT }]);
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
            Add GL Account
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
              <th className="w-48 border-b border-slate-200 px-3 py-3">
                GL Account Number
              </th>
              <th className="border-b border-slate-200 px-3 py-3">
                Short Text
              </th>
              <th className="border-b border-slate-200 px-3 py-3">Long Text</th>
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
                    value={row.gl || ""}
                    onChange={(event) =>
                      updateRow(index, "gl", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`GL Account Number ${index + 1}`}
                  />
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.shortText || ""}
                    onChange={(event) =>
                      updateRow(index, "shortText", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`Short Text ${index + 1}`}
                  />
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.longText || ""}
                    onChange={(event) =>
                      updateRow(index, "longText", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`Long Text ${index + 1}`}
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
                          ? "Minimal satu gl account"
                          : "Hapus gl account"
                      }
                      aria-label={`Hapus gl account ${index + 1}`}
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
   GL FORM
========================================================= */

export default function GLFormFields({
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
  requestor = {},
  attachments = [],
  setAttachments,
  existingAttachments = [],
}) {
  const form = {
    ...DEFAULT_GL_FORM,
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
  //   const isPIC = isApprovalMode && approvalRole === "pic";
  //   const isNewRequest = form.requestType === "New";
  //   const isAccounting = isApprovalMode && approvalRole === "accounting";

  let sectionNumber = 0;

  const nextSection = () => {
    sectionNumber += 1;
    return sectionNumber;
  };

  return (
    <div className="space-y-5">
      {/* REQUESTER INFORMATION */}
      <Section number={nextSection()} title="Requester Information">
        <ChoiceGroup
          label="Company Code"
          groupKey="gl_company_code"
          value={form.companyCode}
          onChange={(value) => update("companyCode", value)}
          required={isCreateMode}
          disabled={!editable("companyCode")}
        />

        <ChoiceGroup
          label="Type of Request"
          groupKey="gl_request_type"
          value={form.requestType}
          onChange={(value) => update("requestType", value)}
          required={isCreateMode}
          disabled={!editable("requestType")}
        />

        <ReadOnlyField label="Name" value={requestor.name} />
        <ReadOnlyField label="Position" value={requestor.position} />
        <ReadOnlyField label="Department" value={requestor.department} />

        <Field label="Purpose of Use" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.purposeOfUse || ""}
            onChange={(event) => update("purposeOfUse", event.target.value)}
            required={isCreateMode}
            disabled={!editable("purposeOfUse")}
          />
        </Field>

        <ChoiceGroup
          label="Account Group"
          groupKey="gl_account_group"
          value={form.accountGroup}
          onChange={(value) => update("accountGroup", value)}
          required={isCreateMode}
          disabled={!editable("accountGroup")}
        />

        <GLAccountTable
          label="GL Account Details"
          value={form.glAccount}
          onChange={(value) => update("glAccount", value)}
          required={isCreateMode}
          disabled={!editable("glAccount")}
        />
      </Section>

      {/* CONTROL DATA */}
      <Section number={nextSection()} title="Control Data">
        <Field label="Account Currency">
          <input
            type="text"
            className={inputClass}
            value={form.accountCurrency || ""}
            onChange={(event) => update("accountCurrency", event.target.value)}
            disabled={!editable("accountCurrency")}
          />
        </Field>

        <ChoiceGroup
          label="Only Balances in Local Currency"
          groupKey="gl_only_balances_local_currency"
          value={form.onlyBalancesLocalCurrency}
          onChange={(value) => update("onlyBalancesLocalCurrency", value)}
          disabled={!editable("onlyBalancesLocalCurrency")}
        />

        <ChoiceGroup
          label="Tax Category"
          groupKey="gl_tax_category"
          value={form.taxCategory}
          onChange={(value) => update("taxCategory", value)}
          disabled={!editable("taxCategory")}
        />

        <ChoiceGroup
          label="Posting Without Tax Allowed"
          groupKey="gl_posting_without_tax"
          value={form.postingWithoutTax}
          onChange={(value) => update("postingWithoutTax", value)}
          disabled={!editable("postingWithoutTax")}
        />

        <ChoiceGroup
          label="Recont Account for Account Type"
          groupKey="gl_recon_acct_for_acct_type"
          value={form.reconAcctForAcctType}
          onChange={(value) => update("reconAcctForAcctType", value)}
          disabled={!editable("reconAcctForAcctType")}
        />

        <ChoiceGroup
          label="Open Item Management"
          groupKey="gl_open_item_management"
          value={form.openItemManagement}
          onChange={(value) => update("openItemManagement", value)}
          disabled={!editable("openItemManagement")}
        />

        <ChoiceGroup
          label="Line Item Display"
          groupKey="gl_line_item_display"
          value={form.lineItemDisplay}
          onChange={(value) => update("lineItemDisplay", value)}
          disabled={!editable("lineItemDisplay")}
        />

        <Field label="Sort Key">
          <input
            type="text"
            className={inputClass}
            value={form.sortKey || ""}
            onChange={(event) => update("sortKey", event.target.value)}
            disabled={!editable("sortKey")}
          />
        </Field>

        <Field label="Field Status Group">
          <input
            type="text"
            className={inputClass}
            value={form.fieldStatusGroup || ""}
            onChange={(event) => update("fieldStatusGroup", event.target.value)}
            disabled={!editable("fieldStatusGroup")}
          />
        </Field>

        <ChoiceGroup
          label="Posting Automatically only"
          groupKey="gl_posting_automatically_only"
          value={form.postingAutomaticallyOnly}
          onChange={(value) => update("postingAutomaticallyOnly", value)}
          disabled={!editable("postingAutomaticallyOnly")}
        />
      </Section>

      {/* GL ACCOUNT BANK DATA */}
      <Section number={nextSection()} title="GL Account Bank Data">
        <Field label="Bank Country">
          <input
            type="text"
            className={inputClass}
            value={form.bankCountry || ""}
            onChange={(event) => update("bankCountry", event.target.value)}
            disabled={!editable("bankCountry")}
          />
        </Field>

        <Field label="Bank Key">
          <input
            type="text"
            className={inputClass}
            value={form.bankKey || ""}
            onChange={(event) => update("bankKey", event.target.value)}
            disabled={!editable("bankKey")}
          />
        </Field>

        <Field label="Bank Name">
          <input
            type="text"
            className={inputClass}
            value={form.bankName || ""}
            onChange={(event) => update("bankName", event.target.value)}
            disabled={!editable("bankName")}
          />
        </Field>

        <Field label="Bank Account Number">
          <input
            type="text"
            className={inputClass}
            value={form.bankAccountNumber || ""}
            onChange={(event) =>
              update("bankAccountNumber", event.target.value)
            }
            disabled={!editable("bankAccountNumber")}
          />
        </Field>

        <Field label="Currency">
          <input
            type="text"
            className={inputClass}
            value={form.currency || ""}
            onChange={(event) => update("currency", event.target.value)}
            disabled={!editable("currency")}
          />
        </Field>
      </Section>

      {/* ASSIGNMENT SOURCE GROUP */}
      <Section number={nextSection()} title="Assignment Source Group">
        <ChoiceGroup
          label="Cost Element Group"
          groupKey="gl_cost_element_group"
          value={form.costElementGroup}
          onChange={(value) => update("costElementGroup", value)}
          disabled={!editable("costElementGroup")}
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
