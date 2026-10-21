const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const readOnlyInputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs text-slate-500 cursor-not-allowed outline-none";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

const requiredClass = "text-red-600";

export function Field({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className={requiredClass}>*</span>}
      </label>

      {children}
    </div>
  );
}

export function ReadOnlyField({ label, value, lockedBy = "" }) {
  const displayValue =
    value !== undefined && value !== null && String(value).trim() !== ""
      ? value
      : "-";

  return (
    <Field label={label}>
      <div className="relative">
        <input
          type="text"
          className={readOnlyInputClass}
          value={displayValue}
          readOnly
        />

        {lockedBy && (
          <span className="mt-1 block text-xs font-medium text-slate-500">
            {lockedBy}
          </span>
        )}
      </div>
    </Field>
  );
}

export function PairedTextField({
  label,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  leftPlaceholder = "",
  rightPlaceholder = "",
  rightType = "text",
  separator = "/",
  requiredLeft = false,
  requiredRight = false,
  disabled = false,
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {(requiredLeft || requiredRight) && (
          <span className={requiredClass}>*</span>
        )}
      </label>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <input
          type="text"
          className={inputClass}
          value={leftValue || ""}
          onChange={(event) => onLeftChange?.(event.target.value)}
          placeholder={leftPlaceholder}
          required={requiredLeft && !disabled}
          disabled={disabled}
        />

        <span className="text-sm text-slate-400">{separator}</span>

        <input
          type={rightType}
          className={inputClass}
          value={rightValue || ""}
          onChange={(event) => onRightChange?.(event.target.value)}
          placeholder={rightPlaceholder}
          required={requiredRight && !disabled}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
