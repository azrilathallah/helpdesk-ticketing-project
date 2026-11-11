import { customerApproval } from "./CustomerApproval";
import { vendorApproval } from "./VendorApproval";
import { materialApproval } from "./MaterialApproval";
import { glApproval } from "./GLApproval";
import { userIdApproval } from "./UserIdApproval";
import { costProfitApproval } from "./CostProfitApproval";
import { sapSupportApproval } from "./SapSupportApproval";

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
