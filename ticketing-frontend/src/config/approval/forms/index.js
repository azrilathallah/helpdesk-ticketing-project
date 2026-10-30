import { customerApproval } from "./CustomerApproval";
import { vendorApproval } from "./VendorApproval";
import { materialApproval } from "./MaterialApproval";
import { glApproval } from "./GLApproval";

export const approvalFormLogic = {
  customer: customerApproval,
  vendor: vendorApproval,
  material: materialApproval,
  gl: glApproval,
};

export function getApprovalFormLogic(submission) {
  const key = String(submission?.sub_category || "")
    .trim()
    .toLowerCase();
  return approvalFormLogic[key] || null;
}
