import ChoiceGroup from "../ChoiceGroup";
import AttachmentField from "../AttachmentField";
import { Field, ReadOnlyField } from "../FormField";

export const DEFAULT_MATERIAL_FORM = {
  requestType: "New",
  materialCode: "",

  industrySector: "I",
  materialType: "",
  plant: "",
  salesOrganization: "",
  distributionChannel: "00",
  storageLocation: "",
  kodeSPMS: "",

  description: "",
  baseUnitofMeasure: "",
  materialGroup: "",

  division: "",
  genItemCatGroup: "",
  tax: "",
  matlStatisGroup: "1",
  AccAssignementGroup: "",
  reconAccount: "",

  glAccount: "",
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
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const readOnlyInputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs text-slate-500 cursor-not-allowed outline-none";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

function isEditable({ mode, readOnly, approvalRole, field }) {
  if (readOnly) return false;
  if (mode === "create") return true;
  if (mode === "submission") return false;
  if (mode !== "approval") return false;

  if (approvalRole === "accounting") {
    return ["reconAccount", "glAccount"].includes(field);
  }

  if (approvalRole === "pic") {
    return field === "materialCode";
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
   MATERIAL FORM
========================================================= */

export default function MaterialFormFields({
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
  attachments = [],
  setAttachments,
  existingAttachments = [],
  onMaterialCodeChange,
}) {
  const form = {
    ...DEFAULT_MATERIAL_FORM,
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

  // Kondisi berdasarkan Material Type
  const isZCOM = form.materialType === "ZCOM";
  const isZINV = form.materialType === "ZINV";
  const isYPRO = form.materialType === "YPRO";
  const isYOMV = form.materialType === "YOMV";

  let sectionNumber = 0;

  const nextSection = () => {
    sectionNumber += 1;
    return sectionNumber;
  };

  return (
    <div className="space-y-5">
      {/* 1. REQUEST TYPE */}
      <Section number={nextSection()} title="Request Type">
        <ChoiceGroup
          label="Request Type"
          groupKey="material_request_type"
          value={form.requestType}
          onChange={(value) => update("requestType", value)}
          required={isCreateMode}
          disabled={!editable("requestType")}
        />

        {isNewRequest && !isPIC ? (
          <ReadOnlyField
            label="Material Code"
            value={form.materialCode || "-"}
          />
        ) : (
          <Field label="Material Code" required={isPIC || isCreateMode}>
            <input
              type="text"
              className={inputClass}
              value={form.materialCode || ""}
              onChange={(event) => {
                const value = event.target.value;
                update("materialCode", value);
                onMaterialCodeChange?.(value);
              }}
              placeholder="Masukkan material code"
              required={isPIC || isCreateMode}
              disabled={!editable("materialCode")}
            />
          </Field>
        )}
      </Section>

      {/* 2. INITIAL SCREEN */}
      <Section number={nextSection()} title="Initial Screen">
        <ChoiceGroup
          label="Industry Sector"
          groupKey="material_industry_sector"
          value={form.industrySector}
          onChange={(value) => update("industrySector", value)}
          required={isCreateMode}
          disabled={!editable("industrySector")}
        />

        <ChoiceGroup
          label="Material Type"
          groupKey="material_type"
          value={form.materialType}
          onChange={(value) => {
            setFormData?.((previous) => ({
              ...previous,
              materialType: value,
            }));
          }}
          required={isCreateMode}
          disabled={!editable("materialType")}
        />

        <ChoiceGroup
          label="Plant"
          groupKey="material_plant"
          value={form.plant}
          onChange={(value) => update("plant", value)}
          required={isCreateMode}
          disabled={!editable("plant")}
        />

        {isZCOM && (
          <ChoiceGroup
            label="Sales Organization"
            groupKey="material_sales_organization"
            value={form.salesOrganization}
            onChange={(value) => update("salesOrganization", value)}
            required={isCreateMode}
            disabled={!editable("salesOrganization")}
          />
        )}

        {isZCOM && (
          <ChoiceGroup
            label="Distribution Channel"
            groupKey="material_distribution_channel"
            value={form.distributionChannel}
            onChange={(value) => update("distributionChannel", value)}
            required={isCreateMode}
            disabled={!editable("distributionChannel")}
          />
        )}

        <Field label="Storage Location" required={isCreateMode && isZINV}>
          <input
            type="text"
            className={inputClass}
            value={form.storageLocation || ""}
            onChange={(event) => update("storageLocation", event.target.value)}
            required={isCreateMode && isZINV}
            disabled={!editable("storageLocation")}
          />
        </Field>

        <Field label="Kode SPMS" required={isCreateMode && isYOMV}>
          <input
            type="text"
            className={inputClass}
            value={form.kodeSPMS || ""}
            onChange={(event) => update("kodeSPMS", event.target.value)}
            required={isCreateMode && isYOMV}
            disabled={!editable("kodeSPMS")}
          />
        </Field>
      </Section>

      {/* 3. BASIC DATA */}
      <Section number={nextSection()} title="Basic Data">
        <Field label="Description" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.description || ""}
            onChange={(event) => update("description", event.target.value)}
            required={isCreateMode}
            disabled={!editable("description")}
          />
        </Field>

        <Field label="Base Unit of Measure" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.baseUnitofMeasure || ""}
            onChange={(event) =>
              update("baseUnitofMeasure", event.target.value)
            }
            required={isCreateMode}
            disabled={!editable("baseUnitofMeasure")}
          />
        </Field>

        <ChoiceGroup
          label="Material Group"
          groupKey="material_group"
          value={form.materialGroup}
          onChange={(value) => update("materialGroup", value)}
          required={isCreateMode}
          disabled={!editable("materialGroup")}
        />
      </Section>

      {/* 4. SALES VIEW */}
      {isZCOM && (
        <Section number={nextSection()} title="Sales View">
          <ChoiceGroup
            label="Division"
            groupKey="material_division"
            value={form.division}
            onChange={(value) => update("division", value)}
            required={isCreateMode}
            disabled={!editable("division")}
          />

          <ChoiceGroup
            label="GenItemCatGroup"
            groupKey="material_genitemcatgroup"
            value={form.genItemCatGroup}
            onChange={(value) => update("genItemCatGroup", value)}
            required={isCreateMode}
            disabled={!editable("genItemCatGroup")}
          />

          <ChoiceGroup
            label="Tax"
            groupKey="material_tax"
            value={form.tax}
            onChange={(value) => update("tax", value)}
            required={isCreateMode}
            disabled={!editable("tax")}
          />

          <ChoiceGroup
            label="Matl. Statis Group"
            groupKey="material_matl_statis_group"
            value={form.matlStatisGroup}
            onChange={(value) => update("matlStatisGroup", value)}
            required={isCreateMode}
            disabled={!editable("matlStatisGroup")}
          />

          <ChoiceGroup
            label="Acct. Assignement Group"
            groupKey="material_acc_assignement_group"
            value={form.accAssignementGroup}
            onChange={(value) => update("accAssignementGroup", value)}
            required={isCreateMode}
            disabled={!editable("accAssignementGroup")}
          />

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
        </Section>
      )}

      {/* 5. Accounting Data 1 */}
      {isYPRO && (
        <Section number={nextSection()} title="Accounting Data 1">
          {isAccounting ? (
            <Field label="GL Account" required>
              <input
                type="text"
                className={inputClass}
                value={form.glAccount || ""}
                onChange={(event) => update("glAccount", event.target.value)}
                required
              />
            </Field>
          ) : (
            <ReadOnlyField label="GL Account" value={form.glAccount} />
          )}
        </Section>
      )}

      {/* 6. ATTACHMENT */}
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
