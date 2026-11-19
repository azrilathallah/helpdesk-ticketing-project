import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submissionApi } from "../../api/submission";
import { showNotification } from "../../utils/notification";
import AttachmentField, {
  validateAttachments,
} from "../../components/AttachmentField";
import { appendAttachments } from "../../utils/attachment";
import ChoiceGroup from "../../components/ChoiceGroup";
import { Field } from "../../components/FormField";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Wrench,
} from "lucide-react";

const TYPE_OPTIONS = [
  {
    key: "IT",
    title: "IT",
    desc: "Hardware, software, network, access, or general IT troubleshooting.",
  },
  {
    key: "SAP",
    title: "SAP",
    desc: "SAP master data management or SAP application support.",
  },
];

const IT_CATEGORIES = [
  {
    key: "Application / System",
    title: "Application / System",
  },
  {
    key: "Network",
    title: "Network & Connectivity",
  },
  {
    key: "Support",
    title: "General IT Support",
  },
];

const SAP_CATEGORIES = [
  {
    key: "Master Data",
    title: "Master Data",
    desc: "Request to create, change, extend, or maintain SAP master data.",
  },
  {
    key: "Support",
    title: "Support",
    desc: "Report an issue, error, or problem when using SAP.",
  },
];

const SAP_SUB_CATEGORIES = [
  {
    key: "Customer",
    title: "Customer",
  },
  {
    key: "Vendor",
    title: "Vendor",
  },
  {
    key: "Material",
    title: "Material",
  },
  {
    key: "User ID",
    title: "User ID",
  },
  {
    key: "GL",
    title: "GL",
  },
  {
    key: "WBS",
    title: "WBS",
  },
  {
    key: "Cost Center and Profit Center",
    title: "Cost Center and Profit Center",
  },
];

function Stepper({ currentStep, labels }) {
  const stepCount = labels.length;
  const progress = stepCount > 1 ? (currentStep - 1) / (stepCount - 1) : 0;
  const lineStart = stepCount > 0 ? 50 / stepCount : 0;
  const lineWidth = stepCount > 1 ? ((stepCount - 1) / stepCount) * 100 : 0;

  return (
    <div className="relative my-4 w-full">
      {stepCount > 1 && (
        <>
          <div
            className="absolute top-4 h-0.5 -translate-y-1/2 rounded-full bg-slate-200"
            style={{
              left: `${lineStart}%`,
              width: `${lineWidth}%`,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-4 h-0.5 -translate-y-1/2 origin-left rounded-full bg-blue-600 transition-transform duration-300"
            style={{
              left: `${lineStart}%`,
              width: `${lineWidth}%`,
              transform: `scaleX(${progress})`,
            }}
            aria-hidden="true"
          />
        </>
      )}

      <ol className="relative flex w-full items-start">
        {labels.map((label, index) => {
          const number = index + 1;
          const active = number === currentStep;
          const completed = number < currentStep;

          return (
            <li
              key={`${number}-${label}`}
              className="flex min-w-0 flex-1 flex-col items-center text-center"
              aria-current={active ? "step" : undefined}
            >
              <div
                className={[
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center",
                  "rounded-full border-2 text-xs font-bold transition-all duration-200",
                  completed
                    ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                    : active
                      ? "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-50"
                      : "border-slate-300 bg-white text-slate-400",
                ].join(" ")}
              >
                {completed ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  number
                )}
              </div>

              <span
                className={[
                  "mt-2 max-w-full px-1 text-xs leading-4",
                  active
                    ? "font-bold text-blue-600"
                    : completed
                      ? "font-semibold text-slate-700"
                      : "font-medium text-slate-400",
                ].join(" ")}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OptionCard({ selected, title, description, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        "group relative flex w-full gap-3.5 rounded-xl border px-4 py-3.5 text-left",
        description ? "items-start" : "items-center",
        "transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
        selected
          ? "border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70 hover:shadow-xs",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          description ? "mt-0.5" : "",
          selected
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white group-hover:border-blue-400",
        ].join(" ")}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-sm font-semibold transition-colors",
            selected ? "text-blue-950" : "text-slate-800",
          ].join(" ")}
        >
          {title}
        </span>

        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [selection, setSelection] = useState({
    type: "",
    category: "",
    subCategory: "",
    module: "",
    description: "",
  });

  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getStepLabels = () => {
    if (selection.type === "SAP" && selection.category === "Master Data") {
      return ["Ticket Type", "Category", "Sub Category"];
    }

    return ["Ticket Type", "Category", "Details"];
  };

  const handleBack = () => {
    if (step > 1) setStep((current) => current - 1);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selection.type) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selection.category) return;
      setStep(3);
      return;
    }

    if (step === 3) {
      if (selection.type === "SAP" && selection.category === "Master Data") {
        if (!selection.subCategory) return;

        if (selection.subCategory === "Customer") {
          navigate("/create-ticket/sap-masterdata/customer-form");
          return;
        }

        if (selection.subCategory === "Vendor") {
          navigate("/create-ticket/sap-masterdata/vendor-form");
          return;
        }

        if (selection.subCategory === "Material") {
          navigate("/create-ticket/sap-masterdata/material-form");
          return;
        }

        if (selection.subCategory === "GL") {
          navigate("/create-ticket/sap-masterdata/gl-form");
          return;
        }

        if (selection.subCategory === "User ID") {
          navigate("/create-ticket/sap-masterdata/userid-form");
          return;
        }

        if (selection.subCategory === "WBS") {
          navigate("/create-ticket/sap-masterdata/wbs-form");
          return;
        }

        if (selection.subCategory === "Cost Center and Profit Center") {
          navigate("/create-ticket/sap-masterdata/costprofit-form");
          return;
        }

        return;
      }

      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (selection.type === "SAP" && selection.category === "Support") {
      if (!selection.description.trim()) return;

      const fileError = validateAttachments(attachments);
      if (fileError) {
        setAttachmentError(fileError);
        return;
      }

      setAttachmentError("");
      setSubmitting(true);

      try {
        const selectedModule = selection.module.trim();

        const payload = {
          type: "SAP",
          category: "Support",
          sub_category: null,
          form_type: "SAP - Support",
          status: "SUBMITTED",
          form_data: {
            module: selectedModule,
            description: selection.description.trim(),
            needCrForm: "No",
            hasCrForm: false,
            solution: "",
          },
        };

        const multipart = new FormData();
        multipart.append("data", JSON.stringify(payload));
        appendAttachments(multipart, attachments);

        const response = await submissionApi.create(multipart);
        const saved = response.data?.data;

        showNotification({
          icon: "success",
          title: "Submitted",
          html: `
            Request successfully submitted.
            <br>
            <strong>Number: ${saved?.number}</strong>
          `,
        });

        navigate("/submission");
      } catch (error) {
        console.error(error);
        showNotification({
          icon: "error",
          title: "Failed",
          text:
            error.response?.data?.message ||
            "Failed to submit SAP Support ticket.",
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    console.log("Submitting:", selection);
  };

  const selectType = (type) => {
    setAttachments([]);
    setAttachmentError("");
    setSelection((previous) => ({
      ...previous,
      type,
      category: "",
      subCategory: "",
      module: "",
      description: "",
    }));
  };

  const selectCategory = (category) => {
    setAttachments([]);
    setAttachmentError("");
    setSelection((previous) => ({
      ...previous,
      category,
      subCategory: "",
      module: "",
      description: "",
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setSelection((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const selectSubCategory = (subCategory) => {
    setSelection((previous) => ({ ...previous, subCategory }));
  };

  const isNextDisabled = () => {
    if (submitting) return true;
    if (step === 1 && !selection.type) return true;
    if (step === 2 && !selection.category) return true;

    if (
      step === 3 &&
      selection.type === "SAP" &&
      selection.category === "Master Data" &&
      !selection.subCategory
    ) {
      return true;
    }

    if (
      step === 3 &&
      selection.type === "SAP" &&
      selection.category === "Support" &&
      !selection.description.trim()
    ) {
      return true;
    }

    return false;
  };

  const isFinalSubmitStep =
    step === 3 &&
    !(selection.type === "SAP" && selection.category === "Master Data");

  const getNextButtonLabel = () => {
    if (!isFinalSubmitStep) return "Next";
    return submitting ? "Submitting..." : "Submit";
  };

  const renderSelectionBreadcrumb = () => {
    if (step === 1 || !selection.type) return null;

    return (
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400">Selected:</span>
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
          {selection.type}
        </span>

        {step >= 3 && selection.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
              {selection.category}
            </span>
          </>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="flex-1 py-4">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            What type of issue do you need help with?
          </h2>

          <p className="mt-1 mb-4 text-xs text-slate-500 sm:text-sm">
            Select the category that best matches your request.
          </p>

          <div className="flex flex-col gap-2.5">
            {TYPE_OPTIONS.map((item) => (
              <OptionCard
                key={item.key}
                title={item.title}
                description={item.desc}
                selected={selection.type === item.key}
                onClick={() => selectType(item.key)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (step === 2) {
      const categories =
        selection.type === "IT" ? IT_CATEGORIES : SAP_CATEGORIES;

      return (
        <div className="flex-1 py-4">
          {renderSelectionBreadcrumb()}

          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            {selection.type} Request Type
          </h2>

          <p className="mt-1 mb-4 text-xs text-slate-500 sm:text-sm">
            {selection.type === "IT"
              ? "What kind of IT assistance do you need?"
              : "What kind of SAP assistance do you need?"}
          </p>

          <div className="flex flex-col gap-2.5">
            {categories.map((item) => (
              <OptionCard
                key={item.key}
                title={item.title}
                description={item.desc}
                selected={selection.category === item.key}
                onClick={() => selectCategory(item.key)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (
      step === 3 &&
      selection.type === "SAP" &&
      selection.category === "Master Data"
    ) {
      return (
        <div className="flex-1 py-4">
          {renderSelectionBreadcrumb()}

          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            SAP Master Data
          </h2>

          <p className="mt-1 mb-4 text-xs text-slate-500 sm:text-sm">
            What form do you need?
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {SAP_SUB_CATEGORIES.map((item) => (
              <OptionCard
                key={item.key}
                title={item.title}
                selected={selection.subCategory === item.key}
                onClick={() => selectSubCategory(item.key)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (
      step === 3 &&
      selection.type === "SAP" &&
      selection.category === "Support"
    ) {
      return (
        <div className="flex-1 py-4">
          {renderSelectionBreadcrumb()}

          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            SAP Support
          </h2>

          <p className="mt-1 mb-4 text-xs text-slate-500 sm:text-sm">
            What issue do you have?
          </p>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <ChoiceGroup
              select
              placeholder="Select module"
              label="Module (Optional)"
              groupKey="sap-support_module"
              value={selection.module}
              onChange={(value) =>
                setSelection((previous) => ({ ...previous, module: value }))
              }
              disabled={submitting}
            />

            <Field label="Description" required>
              <textarea
                name="description"
                value={selection.description}
                onChange={handleInputChange}
                className={`${inputClass} resize-y`}
                placeholder="Describe your issue in detail..."
                rows={4}
                disabled={submitting}
                required
              />
            </Field>

            <AttachmentField
              label="Attachment"
              files={attachments}
              existingFiles={attachments}
              onChange={(nextFiles) => {
                setAttachments(nextFiles);
                setAttachmentError(validateAttachments(nextFiles));
              }}
              error={attachmentError}
              disabled={submitting}
            />
          </div>
        </div>
      );
    }

    if (step === 3 && selection.type === "IT") {
      return (
        <div className="flex-1 py-4">
          {renderSelectionBreadcrumb()}

          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-500">
              <Wrench className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-800">
              IT Request Details Coming Soon
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              IT ticket submission form for{" "}
              <strong className="text-slate-700">{selection.category}</strong>{" "}
              is not configured yet.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl">
      <section className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <header className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Create New Ticket
          </h1>
        </header>

        <div className="flex flex-col px-6 py-5 sm:px-8">
          <Stepper currentStep={step} labels={getStepLabels()} />

          {renderStepContent()}

          <footer className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:text-sm"
            >
              <span>{getNextButtonLabel()}</span>
              {!isFinalSubmitStep && <ArrowRight className="h-4 w-4" />}
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}
