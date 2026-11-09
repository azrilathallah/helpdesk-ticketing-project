import { Trash2 } from "lucide-react";
import AttachmentField from "../AttachmentField";
import { Field } from "../FormField";

export const DEFAULT_COSTPROFIT_FORM = {
  cost: [
    {
      costCenter: "",
      shortTextCost: "",
      longTextCost: "",
      personResponsibleCost: "",
      costCenterCategory: "",
      hierarchyAreaCostCenter: "",
      companyCode: "1200",
      businessArea: "",
    },
  ],

  profit: [
    {
      profitCenter: "",
      shortTextProfit: "",
      longTextProfit: "",
      personResponsibleProfit: "",
      hierarchyAreaProfitCenter: "",
    },
  ],
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
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-3 sm:px-4">
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
   TABLE
========================================================= */

const EMPTY_COST = {
  costCenter: "",
  shortTextCost: "",
  longTextCost: "",
  personResponsibleCost: "",
  costCenterCategory: "",
  hierarchyAreaCostCenter: "",
  companyCode: "1200",
  businessArea: "",
};

const EMPTY_PROFIT = {
  profitCenter: "",
  shortTextProfit: "",
  longTextProfit: "",
  personResponsibleProfit: "",
  hierarchyAreaProfitCenter: "",
};

export function CostCenterTable({
  value = [],
  onChange,
  disabled = false,
  required = false,
}) {
  const rows =
    Array.isArray(value) && value.length > 0 ? value : [{ ...EMPTY_COST }];

  const updateRow = (index, field, newValue) => {
    const updatedRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: newValue } : row,
    );

    onChange?.(updatedRows);
  };

  const addRow = () => {
    onChange?.([...rows, { ...EMPTY_COST }]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;

    onChange?.(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="w-full min-w-0 sm:col-span-2">
      {!disabled && (
        <div className="mb-3 flex flex-wrap items-center justify-end">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <span className="text-xs leading-none">+</span>
            Add Cost Center
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-semibold text-slate-700">
                #{index + 1}
              </span>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={rows.length === 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title={
                    rows.length === 1 ? "At least one Cost Center" : "Delete"
                  }
                  aria-label={`Delete Cost Center ${index + 1}`}
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 p-3 sm:p-4">
              <Field label="Cost Center" required={required && !disabled}>
                <input
                  type="text"
                  className={inputClass}
                  value={row.costCenter || ""}
                  onChange={(event) =>
                    updateRow(index, "costCenter", event.target.value)
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Cost Center ${index + 1}`}
                />
              </Field>

              <Field label="Short Text" required={required && !disabled}>
                <input
                  type="text"
                  className={inputClass}
                  value={row.shortTextCost ?? row.shortText ?? ""}
                  onChange={(event) =>
                    updateRow(index, "shortTextCost", event.target.value)
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Short Text ${index + 1}`}
                />
              </Field>

              <Field label="Long Text" required={required && !disabled}>
                <input
                  type="text"
                  className={inputClass}
                  value={row.longTextCost ?? row.longText ?? ""}
                  onChange={(event) =>
                    updateRow(index, "longTextCost", event.target.value)
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Long Text ${index + 1}`}
                />
              </Field>

              <Field label="Person Responsible">
                <input
                  type="text"
                  className={inputClass}
                  value={row.personResponsibleCost || ""}
                  onChange={(event) =>
                    updateRow(
                      index,
                      "personResponsibleCost",
                      event.target.value,
                    )
                  }
                  disabled={disabled}
                  aria-label={`Person Responsible ${index + 1}`}
                />
              </Field>

              <Field label="Cost Center Category">
                <input
                  type="text"
                  className={inputClass}
                  value={row.costCenterCategory || ""}
                  onChange={(event) =>
                    updateRow(index, "costCenterCategory", event.target.value)
                  }
                  disabled={disabled}
                  aria-label={`Cost Center Category ${index + 1}`}
                />
              </Field>

              <Field
                label="Hierarchy Area Cost Center"
                required={required && !disabled}
              >
                <input
                  type="text"
                  className={inputClass}
                  value={row.hierarchyAreaCostCenter || ""}
                  onChange={(event) =>
                    updateRow(
                      index,
                      "hierarchyAreaCostCenter",
                      event.target.value,
                    )
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Hierarchy Area Cost Center ${index + 1}`}
                />
              </Field>

              <Field label="Company Code" required={required && !disabled}>
                <input
                  type="text"
                  className={inputClass}
                  value={row.companyCode || ""}
                  onChange={(event) =>
                    updateRow(index, "companyCode", event.target.value)
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Company Code ${index + 1}`}
                />
              </Field>

              <Field label="Business Area" required={required && !disabled}>
                <input
                  type="text"
                  className={inputClass}
                  value={row.businessArea || ""}
                  onChange={(event) =>
                    updateRow(index, "businessArea", event.target.value)
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Business Area ${index + 1}`}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfitCenterTable({
  value = [],
  onChange,
  disabled = false,
  required = false,
}) {
  const rows =
    Array.isArray(value) && value.length > 0 ? value : [{ ...EMPTY_PROFIT }];

  const updateRow = (index, field, newValue) => {
    const updatedRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: newValue } : row,
    );

    onChange?.(updatedRows);
  };

  const addRow = () => {
    onChange?.([...rows, { ...EMPTY_PROFIT }]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;

    onChange?.(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="w-full min-w-0 sm:col-span-2">
      {!disabled && (
        <div className="mb-3 flex flex-wrap items-center justify-end">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <span className="text-xs leading-none">+</span>
            Add Profit Center
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-semibold text-slate-700">
                #{index + 1}
              </span>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={rows.length === 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title={
                    rows.length === 1 ? "At least one Profit Center" : "Delete"
                  }
                  aria-label={`Delete Profit Center ${index + 1}`}
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 p-3 sm:p-4">
              <Field label="Profit Center" required={required && !disabled}>
                <input
                  type="text"
                  className={inputClass}
                  value={row.profitCenter || ""}
                  onChange={(event) =>
                    updateRow(index, "profitCenter", event.target.value)
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Profit Center ${index + 1}`}
                />
              </Field>

              <Field label="Short Text" required={required && !disabled}>
                <input
                  type="text"
                  className={inputClass}
                  value={row.shortTextProfit ?? row.shortText ?? ""}
                  onChange={(event) =>
                    updateRow(index, "shortTextProfit", event.target.value)
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Short Text ${index + 1}`}
                />
              </Field>

              <Field label="Long Text" required={required && !disabled}>
                <input
                  type="text"
                  className={inputClass}
                  value={row.longTextProfit ?? row.longText ?? ""}
                  onChange={(event) =>
                    updateRow(index, "longTextProfit", event.target.value)
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Long Text ${index + 1}`}
                />
              </Field>

              <Field label="Person Responsible">
                <input
                  type="text"
                  className={inputClass}
                  value={row.personResponsibleProfit || ""}
                  onChange={(event) =>
                    updateRow(
                      index,
                      "personResponsibleProfit",
                      event.target.value,
                    )
                  }
                  disabled={disabled}
                  aria-label={`Person Responsible ${index + 1}`}
                />
              </Field>

              <Field
                label="Hierarchy Area Profit Center"
                required={required && !disabled}
              >
                <input
                  type="text"
                  className={inputClass}
                  value={
                    row.hierarchyAreaProfitCenter ??
                    row.hierarchyAreaCostCenter ??
                    ""
                  }
                  onChange={(event) =>
                    updateRow(
                      index,
                      "hierarchyAreaProfitCenter",
                      event.target.value,
                    )
                  }
                  required={required && !disabled}
                  disabled={disabled}
                  aria-label={`Hierarchy Area Profit Center ${index + 1}`}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
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
        <CostCenterTable
          value={form.cost}
          onChange={(value) => update("cost", value)}
          required={isCreateMode}
          disabled={!editable("cost")}
        />
      </Section>

      {/* PROFIT CENTER */}
      <Section number={nextSection()} title="Profit Center">
        <ProfitCenterTable
          value={form.profit}
          onChange={(value) => update("profit", value)}
          required={isCreateMode}
          disabled={!editable("profit")}
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
