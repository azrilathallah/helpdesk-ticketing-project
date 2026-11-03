import CustomerFormFields from "./customer/CustomerFormFields";
import VendorFormFields from "./vendor/VendorFormFields";
import MaterialFormFields from "./material/MaterialFormFields";
import GLFormFields from "./gl/GLFormFields";
import UserIdFormFields from "./user-id/UserIdFormFields";

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
  onVendorCodeChange,
  onMaterialCodeChange,
  onUserIdCodeChange,
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

  const commonProps = {
    formData,
    setFormData,
    mode,
    readOnly,
    approvalRole,
    requestor,
    attachments,
    setAttachments,
    existingAttachments,
  };

  if (
    normalizedType === "sap" &&
    normalizedCategory === "master data" &&
    normalizedSubCategory === "customer"
  ) {
    return (
      <CustomerFormFields
        {...commonProps}
        onCustomerCodeChange={onCustomerCodeChange}
      />
    );
  }

  if (
    normalizedType === "sap" &&
    normalizedCategory === "master data" &&
    normalizedSubCategory === "vendor"
  ) {
    return (
      <VendorFormFields
        {...commonProps}
        onVendorCodeChange={onVendorCodeChange}
      />
    );
  }

  if (
    normalizedType === "sap" &&
    normalizedCategory === "master data" &&
    normalizedSubCategory === "material"
  ) {
    return (
      <MaterialFormFields
        {...commonProps}
        onMaterialCodeChange={onMaterialCodeChange}
      />
    );
  }

  if (
    normalizedType === "sap" &&
    normalizedCategory === "master data" &&
    normalizedSubCategory === "gl"
  ) {
    return <GLFormFields {...commonProps} />;
  }

  if (
    normalizedType === "sap" &&
    normalizedCategory === "master data" &&
    normalizedSubCategory === "user id"
  ) {
    return (
      <UserIdFormFields
        {...commonProps}
        onUserIdCodeChange={onUserIdCodeChange}
      />
    );
  }
}
