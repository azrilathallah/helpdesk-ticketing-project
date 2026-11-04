import { customerApproval } from "./CustomerApproval";
import { vendorApproval } from "./VendorApproval";
import { materialApproval } from "./MaterialApproval";
import { glApproval } from "./GLApproval";
import { userIdApproval } from "./UserIdApproval";
import { costProfitApproval } from "./CostProfitApproval";

export const approvalFormLogic = {
  customer: customerApproval,
  vendor: vendorApproval,
  material: materialApproval,
  gl: glApproval,
  "user id": userIdApproval,
  "cost center and profit center": costProfitApproval,
};

export function getApprovalFormLogic(submission) {
  const key = String(submission?.sub_category || "")
    .trim()
    .toLowerCase();
  return approvalFormLogic[key] || null;
}
