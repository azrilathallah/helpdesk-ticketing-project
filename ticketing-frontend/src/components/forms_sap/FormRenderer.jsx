import CustomerFormFields from "./customer/CustomerFormFields";

export default function FormRenderer({
  type,
  category,
  subCategory,
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
  const normalizedType = String(type || "")
    .trim()
    .toLowerCase();

  const normalizedCategory = String(category || "")
    .trim()
    .toLowerCase();

  const normalizedSubCategory = String(subCategory || "")
    .trim()
    .toLowerCase();

  if (
    normalizedType === "sap" &&
    normalizedCategory === "master data" &&
    normalizedSubCategory === "customer"
  ) {
    return (
      <CustomerFormFields
        formData={formData}
        setFormData={setFormData}
        mode={mode}
        readOnly={readOnly}
        approvalRole={approvalRole}
        requestor={requestor}
        attachments={attachments}
        setAttachments={setAttachments}
        existingAttachments={existingAttachments}
        onCustomerCodeChange={onCustomerCodeChange}
      />
    );
  }

  return (
    <div className="customer-form__empty">
      <p>
        Form untuk{" "}
        <strong>
          {type || "-"} / {category || "-"} / {subCategory || "-"}
        </strong>{" "}
        belum tersedia.
      </p>
    </div>
  );
}
