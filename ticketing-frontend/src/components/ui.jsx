export function Alert({ type = "error", children }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-green-200 bg-green-50 text-green-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-[13px] ${styles[type] || styles.info}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  loading = false,
  variant = "danger",
  className = "",
  disabled,
  ...props
}) {
  const variants = {
    primary:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
    ghost:
      "bg-white text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
  };

  return (
    <button
      className={[
        "inline-flex w-full items-center justify-center gap-2 rounded-lg",
        "px-5 py-3 text-[15px] font-semibold",
        "transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        "border border-transparent",
        variants[variant] || variants.danger,
        className,
      ].join(" ")}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-[18px] w-[18px] animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
              opacity="0.3"
            />
            <path
              d="M22 12a10 10 0 0 0-10-10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function Input({ label, id, error, className = "", ...props }) {
  const inputId = id || label?.toLowerCase().trim().replace(/\s+/g, "-");

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-semibold text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={[
          "w-full rounded-lg border bg-white px-3.5 py-2.5",
          "text-[15px] text-slate-700 outline-none",
          "placeholder:text-slate-400",
          "transition-shadow focus:ring-4",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-red-500 focus:ring-red-100",
          className,
        ].join(" ")}
        {...props}
      />

      {error && (
        <span id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
