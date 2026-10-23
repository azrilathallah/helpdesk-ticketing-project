import { customerApproval } from "./customerApproval";
import { vendorApproval } from "./vendorApproval";
import { materialApproval } from "./materialApproval";

export const approvalFormLogic = {
  customer: customerApproval,
  vendor: vendorApproval,
  material: materialApproval,
};

export function getApprovalFormLogic(submission) {
  const key = String(submission?.sub_category || "")
    .trim()
    .toLowerCase();
  return approvalFormLogic[key] || null;
}
