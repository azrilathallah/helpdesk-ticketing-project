import { customerApproval } from "./sap/CustomerApproval";
import { vendorApproval } from "./sap/VendorApproval";
import { materialApproval } from "./sap/MaterialApproval";
import { glApproval } from "./sap/GLApproval";
import { userIdApproval } from "./sap/UserIdApproval";
import { costProfitApproval } from "./sap/CostProfitApproval";
import { sapSupportApproval } from "./sap/SapSupportApproval";

export const approvalFormLogic = {
  customer: customerApproval,
  vendor: vendorApproval,
  material: materialApproval,
  gl: glApproval,
  "user id": userIdApproval,
  "cost center and profit center": costProfitApproval,
  support: sapSupportApproval,
};

export function getApprovalFormLogic(submission) {
  const category = String(submission?.category || "")
    .trim()
    .toLowerCase();

  if (category === "support") {
    return sapSupportApproval;
  }

  const key = String(submission?.sub_category || "")
    .trim()
    .toLowerCase();
  return approvalFormLogic[key] || null;
}
