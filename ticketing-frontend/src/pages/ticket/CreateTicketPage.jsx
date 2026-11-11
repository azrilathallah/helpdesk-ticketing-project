import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submissionApi } from "../../api/submission";
import { showNotification } from "../../utils/notification";
import AttachmentField, {
  validateAttachments,
} from "../../components/sap-masterdata/AttachmentField";
import { appendAttachments } from "../../utils/attachment";
import ChoiceGroup from "../../components/sap-masterdata/ChoiceGroup";
import { Field } from "../../components/sap-masterdata/FormField";

const TYPE_OPTIONS = [
  {
    key: "IT",
    title: "IT",
    desc: "Hardware, software, network, access, etc.",
  },
  {
    key: "SAP",
    title: "SAP",
    desc: "SAP master data, application support",
  },
];

const IT_CATEGORIES = [
  {
    key: "Application / System",
    title: "Application / System",
    desc: "Issues related to business applications or system.",
  },
  {
    key: "Network",
    title: "Network",
    desc: "Connectivity, VPN, internet, or network access issues.",
  },
  {
    key: "Support",
    title: "Support",
    desc: "General IT support, troubleshooting, or assistance.",
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

function Stepper({ currentStep, labels }) {
  const stepCount = labels.length;
  const progress = stepCount > 1 ? (currentStep - 1) / (stepCount - 1) : 0;
  const lineStart = stepCount > 0 ? 50 / stepCount : 0;
  const lineWidth = stepCount > 1 ? ((stepCount - 1) / stepCount) * 100 : 0;

  return (
    <div className="relative my-5 w-full">
      {stepCount > 1 && (
        <>
          <div
            className="absolute top-2.5 h-0.5 -translate-y-1/2 rounded-full bg-slate-200"
            style={{
              left: `${lineStart}%`,
              width: `${lineWidth}%`,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-2.5 h-0.5 -translate-y-1/2 origin-left rounded-full bg-blue-600 transition-transform duration-300"
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
                  "relative z-10 flex h-5 w-5 shrink-0 items-center justify-center",
                  "rounded-full border-2 transition-colors duration-200",
                  active || completed
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300 bg-white",
                ].join(" ")}
              >
                {completed && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth={3}
                    className="h-3 w-3"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              <span
                className={[
                  "mt-2 max-w-full px-1 text-xs leading-4",
                  active || completed
                    ? "font-semibold text-blue-600"
                    : "font-medium text-slate-400",
                ].join(" ")}
              >
                {number}. {label}
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
        "flex w-full items-start gap-4 rounded-xl border-2 p-2 text-left",
        "transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
        selected
          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-blue-600" : "border-slate-300",
        ].join(" ")}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">
          {title}
        </span>

        {description && (
          <span className="mt-1 block text-xs text-slate-500">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

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

  const getNextButtonLabel = () => {
    if (step < 3) return "Next";

    if (selection.type === "SAP" && selection.category === "Master Data") {
      return "Next";
    }

    return submitting ? "Submitting..." : "Submit";
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="flex-1 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            What type of issue do you need help with?
          </h3>

          <p className="mb-4 text-sm text-slate-500">
            Select the category that best matches your request.
          </p>

          <div className="flex flex-col gap-2">
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
          <h3 className="text-lg font-semibold text-slate-900">
            {selection.type} Request Type
          </h3>

          <p className="mb-4 text-sm text-slate-500">
            {selection.type === "IT"
              ? "What kind of IT assistance do you need?"
              : "What kind of SAP assistance do you need?"}
          </p>

          <div className="flex flex-col gap-2">
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
      const subCategories = [
        "Customer",
        "Vendor",
        "Material",
        "User ID",
        "GL",
        "WBS",
        "Cost Center and Profit Center",
      ];

      return (
        <div className="flex-1 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            SAP Master Data
          </h3>

          <p className="mb-4 text-sm text-slate-500">What form do you need?</p>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {subCategories.map((item) => (
              <OptionCard
                key={item}
                title={item}
                selected={selection.subCategory === item}
                onClick={() => selectSubCategory(item)}
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
          <h3 className="text-lg font-semibold text-slate-900">SAP Support</h3>

          <p className="mb-4 text-sm text-slate-500">What issue do you have?</p>

          <div className="flex flex-col gap-3">
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
        <div className="min-h-65 flex-1 py-2">
          <h3 className="text-lg font-semibold text-slate-900">
            IT Request Details
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            IT ticket details are not configured yet.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mx-auto w-full">
      <section className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-4">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Create Trouble Ticket
          </h1>
        </header>

        <div className="flex flex-col px-8 py-4">
          <Stepper currentStep={step} labels={getStepLabels()} />

          {renderStepContent()}

          <footer className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-8 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="inline-flex items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-8 py-2 text-sm font-semibold text-white transition hover:border-blue-700 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {getNextButtonLabel()}
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}
