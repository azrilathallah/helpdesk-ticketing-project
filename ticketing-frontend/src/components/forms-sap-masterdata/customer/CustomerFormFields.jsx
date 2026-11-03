import ChoiceGroup from "../ChoiceGroup";
import AttachmentField from "../AttachmentField";
import { Field, ReadOnlyField } from "../FormField";

export const DEFAULT_CUSTOMER_FORM = {
  requestType: "New",
  customerCode: "",
  telephone1: "",

  accountGroup: "",
  companyCode: "1200",
  salesOrganization: "1200",
  distributionChannel: "00",
  division: "00",

  title: "",
  customerName: "",
  searchTerm: "",
  invoiceStreet: "",
  taxStreet: "",
  city: "",
  postalCode: "",
  country: "Indonesia",
  region: "",
  telephone2: "",
  fax: "",
  npwp: "",
  npwpregisteredDate: "",
  customerClass: "",

  reconAccount: "",
  sortKey: "",
  paymentTerms: "",
  toleranceGroup: "",
  witholdingTax: [],

  currency: "IDR",
  customerPricingProcedure: "1",
  customerStatisticGroup: "1",
  taxClassification: "",
};

/* =========================================================
   STYLE HELPERS
========================================================= */

const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function isEditable({ mode, readOnly, approvalRole, field }) {
  if (readOnly) return false;
  if (mode === "create") return true;
  if (mode === "submission") return false;
  if (mode !== "approval") return false;

  if (approvalRole === "accounting") {
    return [
      "accountGroup",
      "reconAccount",
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

      <div className="flex flex-col gap-3 p-3 sm:p-4">{children}</div>
    </section>
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
          groupKey="customer_request_type"
          value={form.requestType}
          onChange={(value) => update("requestType", value)}
          required={isCreateMode}
          disabled={!editable("requestType")}
        />

        {isNewRequest && !isPIC ? (
          <ReadOnlyField
            label="Customer Code"
            value={form.customerCode || "-"}
          />
        ) : (
          <Field label="Customer Code" required={isPIC || isCreateMode}>
            <input
              type="text"
              className={inputClass}
              value={form.customerCode || ""}
              onChange={(event) => {
                const value = event.target.value;
                update("customerCode", value);
                onCustomerCodeChange?.(value);
              }}
              required={isPIC || isCreateMode}
              disabled={!editable("customerCode")}
            />
          </Field>
        )}
      </Section>

      {/* REQUESTOR */}
      <Section number={nextSection()} title="Requestor">
        <ReadOnlyField label="Name" value={requestor.name} />
        <ReadOnlyField label="Position" value={requestor.position} />
        
        <div className="grid grid-cols-2 items-center gap-2">
          <ReadOnlyField label="Division" value={requestor.division} />
          <ReadOnlyField label="Department" value={requestor.department} />
          <Field label="Telephone">
            <input
              type="text"
              className={inputClass}
              value={form.telephone1 || ""}
              onChange={(event) => update("telephone1", event.target.value)}
              disabled={!editable("telephone1")}
            />
          </Field>
          <ReadOnlyField label="Email" value={requestor.email} />
        </div>
      </Section>

      {/* INITIAL SCREEN */}
      <Section number={nextSection()} title="Initial Screen">
        <ChoiceGroup
          label="Account Group"
          groupKey="customer_account_group"
          value={form.accountGroup}
          onChange={(value) => update("accountGroup", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Company Code"
          groupKey="customer_company_code"
          value={form.companyCode}
          onChange={(value) => update("companyCode", value)}
          required={isCreateMode}
          disabled={!editable("companyCode")}
        />

        <ChoiceGroup
          label="Sales Organization"
          groupKey="customer_sales_organization"
          value={form.salesOrganization}
          onChange={(value) => update("salesOrganization", value)}
          required={isCreateMode}
          disabled={!editable("salesOrganization")}
        />

        <ChoiceGroup
          label="Distribution Channel"
          groupKey="customer_distribution_channel"
          value={form.distributionChannel}
          onChange={(value) => update("distributionChannel", value)}
          required={isCreateMode}
          disabled={!editable("distributionChannel")}
        />

        <ChoiceGroup
          label="Division"
          groupKey="customer_division"
          value={form.division}
          onChange={(value) => update("division", value)}
          required={isCreateMode}
          disabled={!editable("division")}
        />
      </Section>

      {/* GENERAL DATA */}
      <Section number={nextSection()} title="General Data">
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

        <div className="grid grid-cols-2 items-center gap-2">
          <Field label="Kota" required={isCreateMode}>
            <input
              type="text"
              className={inputClass}
              value={form.city || ""}
              onChange={(event) => update("city", event.target.value)}
              required={isCreateMode}
              disabled={!editable("city")}
            />
          </Field>

          <Field label="Kode Pos" required={isCreateMode}>
            <input
              type="number"
              className={inputClass}
              value={form.postalCode || ""}
              onChange={(event) => update("postalCode", event.target.value)}
              required={isCreateMode}
              disabled={!editable("postalCode")}
            />
          </Field>
        </div>

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
            value={form.telephone2 || ""}
            onChange={(event) => update("telephone2", event.target.value)}
            disabled={!editable("telephone2")}
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

        <div className="grid grid-cols-2 items-center gap-2">
          <Field label="NPWP (VAT Reg. No.)" required={isCreateMode}>
            <input
              type="text"
              className={inputClass}
              value={form.npwp || ""}
              onChange={(event) => update("npwp", event.target.value)}
              required={isCreateMode}
              disabled={!editable("npwp")}
            />
          </Field>

          <Field
            label="Tanggal Terdaftar (Sesuai Kartu NPWP)"
            required={isCreateMode}
          >
            <input
              type="date"
              className={inputClass}
              value={form.npwpregisteredDate || ""}
              onChange={(event) =>
                update("npwpregisteredDate", event.target.value)
              }
              required={isCreateMode}
              disabled={!editable("npwpregisteredDate")}
            />
          </Field>
        </div>

        <ChoiceGroup
          label="Customer Class"
          groupKey="customer_class"
          value={form.customerClass}
          onChange={(value) => update("customerClass", value)}
          required={isCreateMode}
          disabled={!editable("customerClass")}
        />
      </Section>

      {/* COMPANY CODE DATA */}
      <Section number={nextSection()} title="Company Code Data">
        {isAccounting ? (
          <Field label="Recon Account" required>
            <input
              type="text"
              className={inputClass}
              value={form.reconAccount || ""}
              onChange={(event) => update("reconAccount", event.target.value)}
              required
            />
          </Field>
        ) : (
          <ReadOnlyField label="Recon Account" value={form.reconAccount} />
        )}

        <ChoiceGroup
          label="Sort Key"
          groupKey="customer_sort_key"
          value={form.sortKey}
          onChange={(value) => update("sortKey", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Terms of Payment"
          groupKey="customer_payment_terms"
          value={form.paymentTerms}
          onChange={(value) => update("paymentTerms", value)}
          required={isCreateMode}
          disabled={!editable("paymentTerms")}
        />

        <ChoiceGroup
          label="Tolerance Group"
          groupKey="customer_tolerance_group"
          value={form.toleranceGroup}
          onChange={(value) => update("toleranceGroup", value)}
          required={isAccounting}
          disabled={!isAccounting}
        />

        <ChoiceGroup
          label="Witholding Tax"
          groupKey="customer_witholding_tax"
          value={form.witholdingTax}
          onChange={(value) => update("witholdingTax", value)}
          checkbox
          required={isTax}
          disabled={!isTax}
        />
      </Section>

      {/* SALES AREA DATA */}
      <Section number={nextSection()} title="Sales Area Data">
        <ChoiceGroup
          label="Currency"
          groupKey="customer_currency"
          value={form.currency}
          onChange={(value) => update("currency", value)}
          required={isCreateMode}
          disabled={!editable("currency")}
        />

        <ChoiceGroup
          label="Customer Pricing Procedure"
          groupKey="customer_pricing_procedure"
          value={form.customerPricingProcedure}
          onChange={(value) => update("customerPricingProcedure", value)}
          required={isCreateMode}
          disabled={!editable("customerPricingProcedure")}
        />

        <ChoiceGroup
          label="Customer Statistic Group"
          groupKey="customer_statistic_group"
          value={form.customerStatisticGroup}
          onChange={(value) => update("customerStatisticGroup", value)}
          required={isCreateMode}
          disabled={!editable("customerStatisticGroup")}
        />

        <ChoiceGroup
          label="Tax Classification"
          groupKey="customer_tax_classification"
          value={form.taxClassification}
          onChange={(value) => update("taxClassification", value)}
          required={isCreateMode}
          disabled={!editable("taxClassification")}
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
