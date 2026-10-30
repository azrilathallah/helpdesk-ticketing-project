import { Trash2, Upload, Paperclip, FileText } from "lucide-react";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

export default function AttachmentField({
  label = "Attachment",
  files = [],
  existingFiles = [],
  onChange,
  error = "",
  disabled = false,
}) {
  const handleFileChange = (event) => {
    if (disabled) return;

    onChange?.(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleRemove = (index) => {
    if (disabled) return;
    onChange?.(files.filter((_, fileIndex) => fileIndex !== index));
  };

  const formatSize = (bytes) => {
    if (!bytes) return "File";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-w-0 sm:col-span-2">
      <label className={labelClass}>{label}</label>

      {!disabled && (
        <div>
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
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <FileText className="h-4 w-4 shrink-0 text-slate-500" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Delete ${file.name}`}
                    title="Delete"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      {disabled && existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
            >
              <Paperclip className="h-4 w-4 shrink-0 text-slate-500" />

              <div className="min-w-0 flex-1">
                <p className="wrap-break-word text-xs font-medium text-slate-800">
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {file.size ? formatSize(file.size) : file.type || "File"}
                </p>
              </div>
            </div>
          ))}
        </div>
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

  const maxSize = 10 * 1024 * 1024;

  if (files.length === 1) {
    return files[0].size > maxSize ? "Maximum file size: 10 MB." : "";
  }

  return "If you are uploading more than one file, please compress them into a single ZIP file.";
};