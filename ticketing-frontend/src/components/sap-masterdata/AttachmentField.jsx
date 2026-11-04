import { useState } from "react";
import {
  Trash2,
  Upload,
  Paperclip,
  FileText,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import {
  MAX_ATTACHMENTS,
  downloadAttachment,
  isNewAttachment,
  isPreviewable,
  openAttachment,
} from "../../utils/attachment";
import { showConfirmation, showNotification } from "../../utils/notification";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

const formatSize = (bytes) => {
  if (!bytes) return "File";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentField({
  label = "Attachment",
  files = [],
  existingFiles = [],
  onChange,
  error = "",
  disabled = false,
}) {
  const [loadingKey, setLoadingKey] = useState(null);

  const canUpload = !disabled && files.length < MAX_ATTACHMENTS;

  const handleAccess = async (file, key, action) => {
    if (loadingKey) return;

    try {
      setLoadingKey(`${key}:${action}`);

      if (action === "download") {
        await downloadAttachment(file);
      } else {
        await openAttachment(file);
      }
    } catch (err) {
      console.error(err);
      showNotification({
        icon: "error",
        title: "Attachment",
        text: err.message || "Failed to load the attachment.",
      });
    } finally {
      setLoadingKey(null);
    }
  };

  const handleFileChange = (event) => {
    if (!canUpload) return;

    const selected = Array.from(event.target.files || []);
    onChange?.([...files, ...selected]);
    event.target.value = "";
  };

  const handleRemove = async (index) => {
    if (disabled) return;

    const file = files[index];

    if (file && !isNewAttachment(file)) {
      const confirmed = await showConfirmation({
        title: "Remove attachment?",
        text: `"${file.name}" will be permanently removed when you save or submit this form.`,
        confirmButtonText: "Remove",
      });

      if (!confirmed) return;
    }

    onChange?.(files.filter((_, fileIndex) => fileIndex !== index));
  };

  const renderAccessButtons = (file, key) => {
    if (!file.url) return null;

    const isBusy = Boolean(loadingKey?.startsWith(`${key}:`));

    return (
      <>
        {isPreviewable(file) && (
          <button
            type="button"
            aria-label={`Open ${file.name}`}
            title="Open"
            onClick={() => handleAccess(file, key, "open")}
            disabled={isBusy}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {loadingKey === `${key}:open` ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Eye size={16} />
            )}
          </button>
        )}

        <button
          type="button"
          aria-label={`Download ${file.name}`}
          title="Download"
          onClick={() => handleAccess(file, key, "download")}
          disabled={isBusy}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
        >
          {loadingKey === `${key}:download` ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
        </button>
      </>
    );
  };

  const renderFileName = (file, key) => {
    if (!file.url) {
      return (
        <p className="wrap-break-word text-xs font-medium text-slate-800">
          {file.name}
        </p>
      );
    }

    return (
      <button
        type="button"
        title={isPreviewable(file) ? "Open" : "Download"}
        onClick={() => handleAccess(file, key, "open")}
        disabled={Boolean(loadingKey)}
        className="wrap-break-word text-left text-xs font-medium text-blue-700 hover:underline disabled:opacity-60"
      >
        {file.name}
      </button>
    );
  };

  const renderFileItem = (file, index, { removable }) => {
    const key = `${file.name}-${index}`;
    const isNew = isNewAttachment(file);
    const Icon = isNew ? FileText : Paperclip;

    return (
      <li
        key={key}
        className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-500" />

        <div className="min-w-0 flex-1">
          {renderFileName(file, key)}
          <p className="text-[10px] text-slate-500">
            {file.size ? formatSize(file.size) : file.type || "File"}
            {isNew && removable}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {renderAccessButtons(file, key)}

          {removable && (
            <button
              type="button"
              aria-label={`Delete ${file.name}`}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
              onClick={() => handleRemove(index)}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="min-w-0 sm:col-span-2">
      <label className={labelClass}>{label}</label>

      {!disabled && (
        <div>
          {canUpload && (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-3 text-center transition hover:border-blue-400 hover:bg-blue-50">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Upload size={18} />
              </span>

              <span className="text-sm font-semibold text-slate-800">
                Upload a file
              </span>

              <span className="mt-1 text-xs leading-5 text-slate-500">
                One file or multiple files in a ZIP. Maximum size: 10 MB.
              </span>

              <input
                type="file"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}

          {files.length > 0 && (
            <>
              <ul className="space-y-2">
                {files.map((file, index) =>
                  renderFileItem(file, index, { removable: true }),
                )}
              </ul>

              {!canUpload && (
                <p className="mt-2 text-[11px] text-slate-500">
                  Only {MAX_ATTACHMENTS} file is allowed. Delete the current
                  file to upload a new one.
                </p>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      {disabled && existingFiles.length > 0 && (
        <ul className="space-y-2">
          {existingFiles.map((file, index) =>
            renderFileItem(file, index, { removable: false }),
          )}
        </ul>
      )}

      {disabled && existingFiles.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
          <Paperclip className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">
              No file was uploaded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const validateAttachments = (files) => {
  if (!files || files.length === 0) return "";

  if (files.length > MAX_ATTACHMENTS) {
    return "If you are uploading more than one file, please compress them into a single ZIP file.";
  }

  const maxSize = 10 * 1024 * 1024;

  const tooLarge = files.some(
    (file) => isNewAttachment(file) && file.size > maxSize,
  );

  return tooLarge ? "Maximum file size: 10 MB." : "";
};
