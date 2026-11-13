import CustomerFormFields from "./sap/CustomerFormFields";
import VendorFormFields from "./sap/VendorFormFields";
import MaterialFormFields from "./sap/MaterialFormFields";
import GLFormFields from "./sap/GLFormFields";
import UserIdFormFields from "./sap/UserIdFormFields";
import CostProfitFormFields from "./sap/CostProfitFormFields";
import WbsFormFields from "./sap/WbsFormFields";
import SapSupportFormFields from "./sap/SapSupportFormFields";

export default function FormRenderer({
  type,
  category,
  subCategory,
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
  status = "",
  requestor = {},
  attachments = [],
  setAttachments,
  existingAttachments = [],
  onCustomerCodeChange,
  onVendorCodeChange,
  onMaterialCodeChange,
  onUserIdCodeChange,
  onOpenCrForm,
  processing = false,
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

  if (
    normalizedType === "sap" &&
    normalizedCategory === "master data" &&
    normalizedSubCategory === "cost center and profit center"
  ) {
    return <CostProfitFormFields {...commonProps} />;
  }

  if (
    normalizedType === "sap" &&
    normalizedCategory === "master data" &&
    normalizedSubCategory === "wbs"
  ) {
    return <WbsFormFields {...commonProps} />;
  }

  if (normalizedType === "sap" && normalizedCategory === "support") {
    return (
      <SapSupportFormFields
        {...commonProps}
        status={status}
        onOpenCrForm={onOpenCrForm}
        processing={processing}
      />
    );
  }
}
