import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "../../utils/notification";

import { approvalApi } from "../../api/approval";
import FormRenderer from "../../components/FormRenderer";
import DataTable from "../../components/DataTable";
import ChoiceGroup from "../../components/ChoiceGroup";

import { getUserValue } from "../../config/UserValue";
import { getApprovalFormLogic } from "../../config/approval";

import { createCustomerActions } from "../../config/approval/sap/CustomerApproval";
import { createVendorActions } from "../../config/approval/sap/VendorApproval";
import { createMaterialActions } from "../../config/approval/sap/MaterialApproval";
import { createGLActions } from "../../config/approval/sap/GLApproval";
import { createUserIdActions } from "../../config/approval/sap/UserIdApproval";
import { createCostProfitActions } from "../../config/approval/sap/CostProfitApproval";
import { createWbsActions } from "../../config/approval/sap/WbsApproval";
import { createSapSupportActions } from "../../config/approval/sap/SapSupportApproval";
import {
  FileEdit,
  ArrowLeft,
  ArrowRightLeft,
  Clock,
  Check,
  AlertCircle,
  Hash,
  User,
  X,
  Download,
} from "lucide-react";
import { downloadAttachment } from "../../utils/attachment";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  REVIEW_REQUESTOR: {
    label: "Needs Approval",
    style: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  APPROVED_REQUESTOR: {
    label: "Approved by Requestor",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_ACC_DEPT_HEAD: {
    label: "Review Accounting Department Head",
    style: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  APPROVED_ACC_DEPT_HEAD: {
    label: "Approved by Accounting Department Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_DIV_HEAD: {
    label: "Review Division Head",
    style: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  APPROVED_DIV_HEAD: {
    label: "Approved by Division Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_ACCOUNTING_HEAD: {
    label: "Review Accounting Head",
    style: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  APPROVED_ACCOUNTING_HEAD: {
    label: "Approved by Accounting Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_TAX_HEAD: {
    label: "Review Tax Head",
    style: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  APPROVED_TAX_HEAD: {
    label: "Approved by Tax Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_IT_SAP_HEAD: {
    label: "Review IT-SAP Head",
    style: "bg-purple-50 text-purple-700 ring-purple-200",
  },
  APPROVED_IT_SAP_HEAD: {
    label: "Approved by IT-SAP Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  WAITING_PIC: {
    label: "Waiting PIC",
    style: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  TICKET_SOLVED: {
    label: "Ticket Solved",
    style: "bg-green-50 text-green-700 ring-green-200",
  },
  TICKET_CANCELLED: {
    label: "Ticket Cancelled",
    style: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  TICKET_REJECTED: {
    label: "Ticket Rejected",
    style: "bg-red-50 text-red-700 ring-red-200",
  },
  REVISION_REQUESTOR: {
    label: "Needs Revision - Requestor",
    style: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  REVISION_ACCOUNTING: {
    label: "Needs Revision - Accounting",
    style: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  REVISION_TAX: {
    label: "Needs Revision - Tax",
    style: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  REVISION_PIC: {
    label: "Needs Revision - PIC",
    style: "bg-orange-50 text-orange-700 ring-orange-200",
  },
};

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "-",
      style: "bg-slate-100 text-slate-700 ring-slate-200",
    }
  );
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-inset ${config.style}`}
    >
      {config.label}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function PageLoading({ message = "Loading..." }) {
  return (
    <main className="mx-auto w-full space-y-5">
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
    </main>
  );
}

function ErrorPanel({ message, onBack, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-xs">
      <div className="flex gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-900">Something went wrong</h2>

          <p className="mt-1 wrap-break-word text-sm text-red-700">{message}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                Try again
              </button>
            )}

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full resize-y rounded-lg border bg-white p-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
        }`}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function ApprovalPage() {
  const { id } = useParams();

  if (id) {
    return <ApprovalDetailPage id={id} />;
  }

  return <ApprovalList />;
}

/* =========================================================
   APPROVAL LIST
========================================================= */

function ApprovalList() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await approvalApi.getAll();
      setSubmissions(response.data?.data || []);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to load request data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleOpen = (submission) => {
    if (!submission?.id) return;

    navigate(`/approval/${submission.id}`);
  };

  const handleDownloadFromList = async (item) => {
    if (!item?.id) return;
    try {
      await downloadAttachment({
        url: `/approvals/${item.id}/pdf`,
        name: `${item.number || `Request_${item.id}`}.pdf`,
        type: "application/pdf",
      });
    } catch (err) {
      console.error(err);
      showNotification({
        icon: "error",
        title: "Failed",
        text: err.message || "Failed to download PDF document.",
      });
    }
  };

  const pendingCount = useMemo(
    () => submissions.filter((item) => Boolean(item.can_act)).length,
    [submissions],
  );

  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-4">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Approval List
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            View and process requests that require your approval.
          </p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <article className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-3.5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Approval
            </p>
            <p className="mt-1 text-sm font-extrabold tabular-nums tracking-tight text-amber-600 sm:text-xl">
              {loading ? "—" : pendingCount}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 transition-transform duration-200 group-hover:scale-110">
            <FileEdit className="h-5 w-5" />
          </div>
        </article>
      </section>

      {/* Approval List */}
      <DataTable
        mode="approval"
        title="Approval List"
        submissions={submissions}
        loading={loading}
        error={error}
        onRetry={loadApprovals}
        onOpen={handleOpen}
        onDownloadPdf={handleDownloadFromList}
      />
    </main>
  );
}

/* =========================================================
   APPROVAL DETAIL
========================================================= */

function ApprovalDetailPage({ id }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({});

  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionError, setRevisionError] = useState("");

  const [assignModuleModalOpen, setAssignModuleModalOpen] = useState(false);
  const [targetModule, setTargetModule] = useState("");
  const [assignModuleError, setAssignModuleError] = useState("");

  const [picModuleModalOpen, setPicModuleModalOpen] = useState(false);
  const [picModuleAction, setPicModuleAction] = useState("");
  const [selectedOwnModule, setSelectedOwnModule] = useState("");
  const [picModuleError, setPicModuleError] = useState("");

  const getDefaultForm = (data) => {
    return getApprovalFormLogic(data)?.getDefaultForm() || {};
  };

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await approvalApi.getById(id);
      const data = response.data?.data;

      if (!data) {
        throw new Error("Request not found.");
      }

      setSubmission(data);

      setFormData({
        ...getDefaultForm(data),
        ...(data.form_data || {}),
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load request details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const isCustomerSubmission =
    String(submission?.sub_category).toLowerCase() === "customer";
  const isVendorSubmission =
    String(submission?.sub_category).toLowerCase() === "vendor";
  const isMaterialSubmission =
    String(submission?.sub_category).toLowerCase() === "material";
  const isGLSubmission =
    String(submission?.sub_category).toLowerCase() === "gl";
  const isUserIdSubmission =
    String(submission?.sub_category).toLowerCase() === "user id";
  const isCostProfitSubmission =
    String(submission?.sub_category).toLowerCase() ===
    "cost center and profit center";
  const isWbsSubmission =
    String(submission?.sub_category).toLowerCase() === "wbs";
  const isSapSupportSubmission =
    String(submission?.category).toLowerCase() === "support";

  const formLogic = getApprovalFormLogic(submission);
  const materialType = formLogic?.getMaterialType
    ? formLogic.getMaterialType(submission)
    : "";

  const requestor = useMemo(
    () => ({
      name: getUserValue(submission?.requestor, ["name"]),
      position: getUserValue(submission?.requestor, ["position"]),
      division: getUserValue(submission?.requestor, ["division"]),
      department: getUserValue(submission?.requestor, ["department"]),
      email: getUserValue(submission?.requestor, ["email"]),
      nik: getUserValue(submission?.requestor, ["nik"]),
    }),
    [submission],
  );

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const canAct = Boolean(submission?.can_act);
  const canDownloadPdf = Boolean(
    submission?.status === "TICKET_SOLVED" && submission?.can_download_pdf,
  );

  const handleDownloadPdf = async () => {
    if (!canDownloadPdf || !submission || downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      await downloadAttachment({
        url: `/approvals/${submission.id}/pdf`,
        name: `${submission.number || `Request_${submission.id}`}.pdf`,
        type: "application/pdf",
      });
    } catch (err) {
      console.error(err);
      showNotification({
        icon: "error",
        title: "Failed",
        text: err.message || "Failed to download PDF document.",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const approvalRole = useMemo(() => {
    if (!canAct) return null;

    return (
      submission?.approval_role ||
      formLogic?.getRole(submission?.status, materialType) ||
      null
    );
  }, [
    canAct,
    submission?.approval_role,
    formLogic,
    submission?.status,
    materialType,
  ]);

  const existingRevisionNotes = useMemo(() => {
    const revisionStatuses = [
      "REVISION_PIC",
      "REVISION_REQUESTOR",
      "REVISION_ACCOUNTING",
      "REVISION_TAX",
    ];

    if (!revisionStatuses.includes(submission?.status)) return [];

    const notes = (submission?.approval_history || []).filter(
      (item) => item.action === "REVISION_REQUESTED" && item.notes?.trim(),
    );

    return notes.length > 0 ? [notes[notes.length - 1]] : [];
  }, [submission?.status, submission?.approval_history]);

  /* =========================================================
     ACCOUNTING / TAX SAVED
  ========================================================= */

  const hasAccountingSaved = useMemo(
    () =>
      typeof formLogic?.hasAccountingSaved === "function"
        ? formLogic.hasAccountingSaved(submission, materialType)
        : false,
    [formLogic, submission, materialType],
  );

  const hasTaxSaved = useMemo(
    () =>
      typeof formLogic?.hasTaxSaved === "function"
        ? formLogic.hasTaxSaved(submission)
        : false,
    [formLogic, submission],
  );

  /* =========================================================
     REJECT
  ========================================================= */

  const openRejectModal = () => {
    setRejectNotes("");
    setRejectError("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!submission || processing) return;

    if (!rejectNotes.trim()) {
      setRejectError("Notes / Reason for rejection is required");
      return;
    }

    try {
      setProcessing(true);
      setRejectError("");

      const response = await approvalApi.reject(
        submission.id,
        rejectNotes.trim(),
      );

      showNotification({
        icon: "success",
        title: "Rejected",
        text:
          response?.data?.message || "The request was successfully rejected.",
      });

      setRejectModalOpen(false);
      setRejectNotes("");
      navigate("/approval");
    } catch (err) {
      console.error(err);

      setRejectError(
        err.response?.data?.message || "Failed to reject the request.",
      );
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     REVISION
  ========================================================= */

  const openRevisionModal = () => {
    setRevisionNotes("");
    setRevisionError("");
    setRevisionModalOpen(true);
  };

  const handleConfirmRevision = async () => {
    if (!submission || processing) return;

    if (!revisionNotes.trim()) {
      setRevisionError("Revision notes is required");
      return;
    }

    try {
      setProcessing(true);
      setRevisionError("");

      const response = await approvalApi.revise(
        submission.id,
        revisionNotes.trim(),
      );

      showNotification({
        icon: "success",
        title: "Revision Requested",
        text: response?.data?.message || "The revision was successfully sent.",
      });

      setRevisionModalOpen(false);
      setRevisionNotes("");
      navigate("/approval");
    } catch (err) {
      console.error(err);

      setRevisionError(
        err.response?.data?.message || "The revision failed to send.",
      );
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     ASSIGN / TRANSFER MODULE (SAP SUPPORT)
  ========================================================= */

  const openAssignModuleModal = () => {
    setTargetModule("");
    setAssignModuleError("");
    setAssignModuleModalOpen(true);
  };

  const handleConfirmAssignModule = async () => {
    if (!submission || processing) return;

    const selectedModule = String(targetModule || "").trim();
    const currentModule = String(formData?.module || "").trim();

    if (!selectedModule) {
      setAssignModuleError("Please select a target module.");
      return;
    }

    if (
      currentModule &&
      currentModule.toLowerCase() === selectedModule.toLowerCase()
    ) {
      setAssignModuleError(
        "The selected module is already assigned to this request.",
      );
      return;
    }

    try {
      setProcessing(true);
      setAssignModuleError("");

      const response = await approvalApi.assignModule(
        submission.id,
        selectedModule,
      );

      showNotification({
        icon: "success",
        title: currentModule ? "Module Transferred" : "Module Assigned",
        text:
          response?.data?.message ||
          `The ticket has been assigned to module ${selectedModule}.`,
      });

      setAssignModuleModalOpen(false);
      setTargetModule("");
      navigate("/approval");
    } catch (err) {
      console.error(err);

      setAssignModuleError(
        err.response?.data?.message || "Failed to assign module.",
      );
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     SELECT OWN PIC MODULE (WHEN MULTI-MODULE PIC RESOLVES / FILLS CR)
  ========================================================= */

  const picModules = useMemo(
    () =>
      Array.isArray(submission?.pic_modules) ? submission.pic_modules : [],
    [submission?.pic_modules],
  );

  const openPicModuleModal = (actionType) => {
    setPicModuleAction(actionType);
    setSelectedOwnModule("");
    setPicModuleError("");
    setPicModuleModalOpen(true);
  };

  const handleOpenCrFormClick = () => {
    if (!submission || processing) return;

    const currentModule = String(formData?.module || "").trim();
    if (!currentModule && picModules.length > 1) {
      openPicModuleModal("open-cr");
      return;
    }

    navigate(`/approval/${submission.id}/cr-form`);
  };

  const handleConfirmPicModule = async () => {
    if (!submission || processing) return;

    const chosenModule = String(selectedOwnModule || "").trim();
    if (!chosenModule) {
      setPicModuleError("Please select your module for this request.");
      return;
    }

    setPicModuleModalOpen(false);

    if (picModuleAction === "open-cr") {
      navigate(
        `/approval/${submission.id}/cr-form?module=${encodeURIComponent(chosenModule)}`,
      );
      return;
    }

    if (picModuleAction === "resolve" || picModuleAction === "submit-cr") {
      await handleSapSupportAction(picModuleAction, chosenModule);
    }
  };

  /* =========================================================
     ACTION BUTTONS
  ========================================================= */

  const primaryButton =
    "inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

  const secondaryButton =
    "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

  const rejectButton =
    "inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

  const revisionButton =
    "inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

  const actionContext = {
    approvalApi,
    isCustomerSubmission,
    isVendorSubmission,
    isMaterialSubmission,
    isGLSubmission,
    isUserIdSubmission,
    isCostProfitSubmission,
    isWbsSubmission,
    isSapSupportSubmission,
    submission,
    processing,
    setProcessing,
    setActionError,
    formLogic,
    formData,
    materialType,
    hasAccountingSaved,
    hasTaxSaved,
    loadDetail,
    navigate,
    primaryButton,
    secondaryButton,
    rejectButton,
    revisionButton,
    openRejectModal,
    openRevisionModal,
    openAssignModuleModal,
    openPicModuleModal,
  };

  const customerActions = createCustomerActions(actionContext);
  const vendorActions = createVendorActions(actionContext);
  const materialActions = createMaterialActions(actionContext);
  const glActions = createGLActions(actionContext);
  const userIdActions = createUserIdActions(actionContext);
  const costProfitActions = createCostProfitActions(actionContext);
  const wbsActions = createWbsActions(actionContext);
  const sapSupportActions = createSapSupportActions(actionContext);

  const { renderCustomerActionButtons } = customerActions;
  const { renderVendorActionButtons } = vendorActions;
  const { renderMaterialActionButtons } = materialActions;
  const { renderGLActionButtons } = glActions;
  const { renderUserIdActionButtons } = userIdActions;
  const { renderCostProfitActionButtons } = costProfitActions;
  const { renderWbsActionButtons } = wbsActions;
  const { renderSapSupportActionButtons, handleSapSupportAction } =
    sapSupportActions;

  /* =========================================================
     LOADING / ERROR
  ========================================================= */

  if (loading) {
    return <PageLoading message="Loading request detail..." />;
  }

  if (error) {
    return (
      <main className="mx-auto w-full space-y-5">
        <ErrorPanel
          message={error}
          onRetry={loadDetail}
          onBack={() => navigate("/approval")}
        />
      </main>
    );
  }

  if (!submission) return null;

  /* =========================================================
     APPROVAL HISTORY
  ========================================================= */

  const visibleHistory = (submission.approval_history || []).filter(
    (item) =>
      [
        "REQUESTOR_APPROVE",
        "IT_SAP_HEAD_APPROVE",
        "ACC_DEPT_HEAD_APPROVE",
        "DIV_HEAD_APPROVE",
        "ACCOUNTING_HEAD_APPROVE",
        "TAX_HEAD_APPROVE",
        "PIC_ASSIGN_MODULE",
      ].includes(item.step) ||
      ["SOLVED", "REJECTED", "CANCELLED"].includes(item.action),
  );

  const getHistoryLabel = (item) => {
    if (item.step === "PIC_ASSIGN_MODULE") {
      const fromMod = item.step_data?.from_module;
      const toMod = item.step_data?.to_module || "-";
      return fromMod
        ? `Transferred Module (${fromMod} → ${toMod})`
        : `Assigned to Module ${toMod}`;
    }
    if (item.step === "REQUESTOR_APPROVE") return "Approved by Requestor";
    if (item.step === "IT_SAP_HEAD_APPROVE") return "Approved by IT-SAP Head";
    if (item.step === "ACC_DEPT_HEAD_APPROVE")
      return "Approved by Accounting Department Head";
    if (item.step === "DIV_HEAD_APPROVE") return "Approved by Division Head";
    if (item.step === "ACCOUNTING_HEAD_APPROVE")
      return "Approved by Accounting Head";
    if (item.step === "TAX_HEAD_APPROVE") return "Approved by Tax Head";
    if (item.action === "SOLVED") return "Ticket Solved";
    if (item.action === "REJECTED") return "Ticket Rejected";
    if (item.action === "CANCELLED") return "Ticket Cancelled";

    return item.step || item.action || "Activity";
  };

  const isNegativeHistoryItem = (item) =>
    ["REJECTED", "CANCELLED"].includes(item.action);

  /* =========================================================
     DETAIL PAGE
  ========================================================= */

  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-5">
      {/* Detail Card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <header className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate("/approval")}
            disabled={processing}
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                {submission.type} · {submission.category}
                {submission.sub_category &&
                String(submission.category).toLowerCase() !== "support"
                  ? ` · ${submission.sub_category}`
                  : ""}
              </p>

              <h1 className="mt-1.5 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {submission.category}
                {submission.sub_category &&
                String(submission.category).toLowerCase() !== "support"
                  ? ` ${submission.sub_category}`
                  : ""}{" "}
                Request
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  Request Number:{" "}
                  <strong className="font-bold text-slate-900">
                    {submission.number || "-"}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canDownloadPdf && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloadingPdf ? "Downloading..." : "Download PDF"}
                </button>
              )}
              <StatusBadge status={submission.status} />
            </div>
          </div>
        </header>

        {/* Action Error */}
        {actionError && (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-7">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>

            <p className="min-w-0 flex-1 wrap-break-word">{actionError}</p>

            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setActionError("")}
              className="rounded px-1 font-semibold text-red-500 hover:bg-red-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Form */}
        <div className="p-4 sm:p-6">
          {existingRevisionNotes.length > 0 && (
            <section className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 sm:px-4">
              <h2 className="text-sm font-semibold text-orange-800">
                Revision Notes
              </h2>

              <div className="mt-1 space-y-3">
                {existingRevisionNotes.map((item, index) => (
                  <div key={`${item.id ?? item.step}-${index}`}>
                    <div className="rounded-sm border border-orange-300 bg-white p-2">
                      <p className="whitespace-pre-wrap wrap-break-word text-xs text-slate-700">
                        {item.notes}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1 px-1">
                      {item.actor?.name && (
                        <p className="text-xs text-slate-500">
                          By: {item.actor.name}
                        </p>
                      )}

                      {item.created_at && (
                        <p className="text-xs text-slate-500">
                          {formatDate(item.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <form onSubmit={(event) => event.preventDefault()}>
            <FormRenderer
              type={submission.type}
              category={submission.category}
              subCategory={submission.sub_category}
              formData={formData}
              setFormData={setFormData}
              mode="approval"
              readOnly={!canAct}
              approvalRole={approvalRole}
              status={submission.status}
              requestor={requestor}
              existingAttachments={submission.attachments || []}
              onOpenCrForm={handleOpenCrFormClick}
              processing={processing}
            />

            {/* Approval Actions */}
            {canAct && (
              <>
                {isCustomerSubmission && renderCustomerActionButtons()}
                {isVendorSubmission && renderVendorActionButtons()}
                {isMaterialSubmission && renderMaterialActionButtons()}
                {isGLSubmission && renderGLActionButtons()}
                {isUserIdSubmission && renderUserIdActionButtons()}
                {isCostProfitSubmission && renderCostProfitActionButtons()}
                {isWbsSubmission && renderWbsActionButtons()}
                {isSapSupportSubmission && renderSapSupportActionButtons()}
              </>
            )}

            {canDownloadPdf && (
              <div className="mt-6 flex flex-row items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                >
                  <Download className="h-4 w-4" />
                  {downloadingPdf ? "Downloading..." : "Download PDF"}
                </button>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Approval History */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Clock className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Approval History
              </h2>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {visibleHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
                <Clock className="h-4 w-4" />
              </div>
              <p className="mt-2.5 text-xs font-semibold text-slate-700">
                No approval history yet
              </p>
            </div>
          ) : (
            <ol className="space-y-0">
              {visibleHistory.map((item, index) => {
                const negative = isNegativeHistoryItem(item);

                return (
                  <li
                    key={item.id ?? `${item.step}-${item.created_at}-${index}`}
                  >
                    <div className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-white ${
                            negative
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {negative ? (
                            <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                          ) : (
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          )}
                        </div>

                        {index < visibleHistory.length - 1 && (
                          <div className="my-1 min-h-8 w-px flex-1 bg-slate-200" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                          <h3
                            className={`text-xs font-bold ${
                              negative ? "text-red-700" : "text-slate-900"
                            }`}
                          >
                            {getHistoryLabel(item)}
                          </h3>

                          <time className="shrink-0 text-[11px] font-medium text-slate-400">
                            {formatDate(item.created_at)}
                          </time>
                        </div>

                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>By: {item.actor?.name || "-"}</span>
                        </p>

                        {item.notes && (
                          <div className="mt-2 wrap-break-word whitespace-pre-wrap rounded-lg border border-slate-200/80 bg-slate-50 p-2.5 text-xs text-slate-700">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {rejectModalOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !processing) {
              setRejectModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <h2
                  id="reject-modal-title"
                  className="text-sm font-bold text-slate-900"
                >
                  Reject Request
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setRejectModalOpen(false)}
                disabled={processing}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="rounded-xl border border-red-200/80 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-700">
                You are about to reject request{" "}
                <strong className="font-bold">{submission.number}</strong>.
              </div>

              <TextareaField
                label="Notes / Reason for rejection"
                value={rejectNotes}
                onChange={(event) => setRejectNotes(event.target.value)}
                placeholder="Write the reason for the rejection..."
                disabled={processing}
                error={rejectError}
              />
            </div>

            <footer className="flex flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setRejectModalOpen(false)}
                disabled={processing}
              >
                Cancel
              </button>

              <button
                type="button"
                className={rejectButton}
                onClick={handleConfirmReject}
                disabled={processing || !rejectNotes.trim()}
              >
                {processing ? "Processing..." : "Confirm Reject"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* =====================================================
          REVISION MODAL
      ===================================================== */}

      {revisionModalOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !processing) {
              setRevisionModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="revision-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                  <FileEdit className="h-4 w-4" />
                </div>
                <h2
                  id="revision-modal-title"
                  className="text-sm font-bold text-slate-900"
                >
                  Request Revision
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setRevisionModalOpen(false)}
                disabled={processing}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="rounded-xl border border-orange-200/80 bg-orange-50/70 px-3.5 py-2.5 text-xs text-orange-700">
                Revision notes will help the relevant parties correct the data.
              </div>

              <TextareaField
                label="Revision notes"
                value={revisionNotes}
                onChange={(event) => setRevisionNotes(event.target.value)}
                placeholder="Write the notes for the revision..."
                disabled={processing}
                error={revisionError}
              />
            </div>

            <footer className="flex flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setRevisionModalOpen(false)}
                disabled={processing}
              >
                Cancel
              </button>

              <button
                type="button"
                className={revisionButton}
                onClick={handleConfirmRevision}
                disabled={processing || !revisionNotes.trim()}
              >
                {processing ? "Processing..." : "Submit Revision"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* =====================================================
          ASSIGN / TRANSFER MODULE MODAL
      ===================================================== */}

      {assignModuleModalOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !processing) {
              setAssignModuleModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-module-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <h2
                  id="assign-module-modal-title"
                  className="text-sm font-bold text-slate-900"
                >
                  {String(formData?.module || "").trim()
                    ? "Transfer Module"
                    : "Assign Module"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setAssignModuleModalOpen(false)}
                disabled={processing}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 px-3.5 py-2.5 text-xs text-blue-700">
                {String(formData?.module || "").trim() ? (
                  <>
                    Current module is{" "}
                    <strong className="font-bold">{formData.module}</strong>.
                    Select the appropriate module to transfer request{" "}
                    <strong className="font-bold">{submission.number}</strong>{" "}
                    to its PIC.
                  </>
                ) : (
                  <>
                    This request currently has no module assigned. Select the
                    appropriate module to assign request{" "}
                    <strong className="font-bold">{submission.number}</strong>{" "}
                    to its PIC.
                  </>
                )}
              </div>

              <div>
                <ChoiceGroup
                  select
                  required
                  label="Target Module"
                  placeholder="Select module"
                  groupKey="sap-support_module"
                  value={targetModule}
                  onChange={(value) => {
                    setTargetModule(value);
                    if (assignModuleError) setAssignModuleError("");
                  }}
                  disabled={processing}
                />

                {assignModuleError && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {assignModuleError}
                  </p>
                )}
              </div>
            </div>

            <footer className="flex flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setAssignModuleModalOpen(false)}
                disabled={processing}
              >
                Cancel
              </button>

              <button
                type="button"
                className={primaryButton}
                onClick={handleConfirmAssignModule}
                disabled={processing || !String(targetModule || "").trim()}
              >
                {processing
                  ? "Processing..."
                  : String(formData?.module || "").trim()
                    ? "Transfer Module"
                    : "Assign Module"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* =====================================================
          SELECT OWN PIC MODULE MODAL (MULTI-MODULE PIC)
      ===================================================== */}

      {picModuleModalOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !processing) {
              setPicModuleModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pic-own-module-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <Check className="h-4 w-4" />
                </div>
                <h2
                  id="pic-own-module-modal-title"
                  className="text-sm font-bold text-slate-900"
                >
                  Select Your Module
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setPicModuleModalOpen(false)}
                disabled={processing}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 px-3.5 py-2.5 text-xs text-blue-700">
                You are assigned as PIC for multiple modules. Please select which
                of your modules handles request{" "}
                <strong className="font-bold">{submission.number}</strong>.
              </div>

              <div>
                <ChoiceGroup
                  select
                  required
                  label="Module"
                  placeholder="Select your module"
                  groupKey="sap-support_module"
                  allowedValues={picModules}
                  value={selectedOwnModule}
                  onChange={(value) => {
                    setSelectedOwnModule(value);
                    if (picModuleError) setPicModuleError("");
                  }}
                  disabled={processing}
                />

                {picModuleError && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {picModuleError}
                  </p>
                )}
              </div>
            </div>

            <footer className="flex flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setPicModuleModalOpen(false)}
                disabled={processing}
              >
                Cancel
              </button>

              <button
                type="button"
                className={primaryButton}
                onClick={handleConfirmPicModule}
                disabled={processing || !String(selectedOwnModule || "").trim()}
              >
                {processing
                  ? "Processing..."
                  : picModuleAction === "resolve"
                    ? "Confirm & Resolve"
                    : picModuleAction === "submit-cr"
                      ? "Confirm & Submit CR"
                      : "Continue to CR Form"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
