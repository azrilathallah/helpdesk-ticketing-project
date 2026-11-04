import ChoiceGroup from "../ChoiceGroup";
import AttachmentField from "../AttachmentField";
import { Field } from "../FormField";

export const DEFAULT_COSTPROFIT_FORM = {
  costCenter: "",
  shortTextCost: "",
  longTextCost: "",
  personResponsibleCost: "",
  costCenterCategory: "",
  hierarchyAreaCostCenter: "",
  companyCode: "1200",
  businessArea: "",

  profitCenter: "",
  shortTextProfit: "",
  longTextProfit: "",
  personResponsibleProfit: "",
  hierarchyAreaProfitCenter: "",
};

/* =========================================================
   STYLE HELPERS
========================================================= */

const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function isEditable({ mode, readOnly }) {
  if (readOnly) return false;
  if (mode === "create") return true;
  if (mode === "submission") return false;
  if (mode !== "approval") return false;

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
   COST PROFIT FORM
========================================================= */

export default function CostProfitFormFields({
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
  attachments = [],
  setAttachments,
  existingAttachments = [],
}) {
  const form = {
    ...DEFAULT_COSTPROFIT_FORM,
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

  let sectionNumber = 0;
  const nextSection = () => {
    sectionNumber += 1;
    return sectionNumber;
  };

  return (
    <div className="space-y-5">
      {/* COST CENTER */}
      <Section number={nextSection()} title="Cost Center">
        <Field label="Cost Center" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.costCenter}
            onChange={(event) => update("costCenter", event.target.value)}
            required={isCreateMode}
            disabled={!editable("costCenter")}
          />
        </Field>

        <Field label="Short Text" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.shortTextCost}
            onChange={(event) => update("shortTextCost", event.target.value)}
            required={isCreateMode}
            disabled={!editable("shortTextCost")}
          />
        </Field>

        <Field label="Long Text" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.longTextCost}
            onChange={(event) => update("longTextCost", event.target.value)}
            required={isCreateMode}
            disabled={!editable("longTextCost")}
          />
        </Field>

        <Field label="Person Responsible">
          <input
            type="text"
            className={inputClass}
            value={form.personResponsibleCost}
            onChange={(event) =>
              update("personResponsibleCost", event.target.value)
            }
            disabled={!editable("personResponsibleCost")}
          />
        </Field>

        <Field label="Cost Center Category">
          <input
            type="text"
            className={inputClass}
            value={form.costCenterCategory}
            onChange={(event) =>
              update("costCenterCategory", event.target.value)
            }
            disabled={!editable("costCenterCategory")}
          />
        </Field>

        <Field label="Hierarchy Area Cost Center" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.hierarchyAreaCostCenter}
            onChange={(event) =>
              update("hierarchyAreaCostCenter", event.target.value)
            }
            required={isCreateMode}
            disabled={!editable("hierarchyAreaCostCenter")}
          />
        </Field>

        <ChoiceGroup
          label="Company Code"
          groupKey="cost-profit_company_code"
          value={form.companyCode}
          onChange={(value) => update("companyCode", value)}
          required={isCreateMode}
          disabled={!editable("companyCode")}
        />

        <Field label="Business Area" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.businessArea}
            onChange={(event) => update("businessArea", event.target.value)}
            required={isCreateMode}
            disabled={!editable("businessArea")}
          />
        </Field>
      </Section>

      {/* PROFIT CENTER */}
      <Section number={nextSection()} title="Profit Center">
        <Field label="Profit Center" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.profitCenter}
            onChange={(event) => update("profitCenter", event.target.value)}
            required={isCreateMode}
            disabled={!editable("profitCenter")}
          />
        </Field>

        <Field label="Short Text" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.shortTextProfit}
            onChange={(event) => update("shortTextProfit", event.target.value)}
            required={isCreateMode}
            disabled={!editable("shortTextProfit")}
          />
        </Field>

        <Field label="Long Text" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.longTextProfit}
            onChange={(event) => update("longTextProfit", event.target.value)}
            required={isCreateMode}
            disabled={!editable("longTextProfit")}
          />
        </Field>

        <Field label="Person Responsible">
          <input
            type="text"
            className={inputClass}
            value={form.personResponsibleProfit}
            onChange={(event) =>
              update("personResponsibleProfit", event.target.value)
            }
            disabled={!editable("personResponsibleProfit")}
          />
        </Field>

        <Field label="Hierarchy Area Profit Center" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.hierarchyAreaProfitCenter}
            onChange={(event) =>
              update("hierarchyAreaProfitCenter", event.target.value)
            }
            required={isCreateMode}
            disabled={!editable("hierarchyAreaProfitCenter")}
          />
        </Field>
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
