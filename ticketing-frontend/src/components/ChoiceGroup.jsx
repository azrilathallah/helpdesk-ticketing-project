import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ChoiceGroup({
  groupKey,
  label,
  value,
  onChange,
  checkbox = false,
  select = false,
  placeholder = "",
  disabled = false,
  required = false,
}) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setOptions([]);

      try {
        const response = await api.get(
          `/choice-options/${encodeURIComponent(groupKey)}`,
        );

        if (!cancelled) {
          setOptions(response.data?.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setOptions([]);
        }
      }
    }

    if (groupKey) {
      loadOptions();
    } else {
      setOptions([]);
    }

    return () => {
      cancelled = true;
    };
  }, [groupKey]);

  const normalizedValue = value ?? (checkbox ? [] : "");

  const selectedValues = Array.isArray(normalizedValue)
    ? normalizedValue.map(String)
    : [];

  const checkboxGroupEmpty = checkbox && selectedValues.length === 0;

  if (select) {
    const selectedCode = String(normalizedValue ?? "");
    const hasSelectedOption = options.some(
      (option) => String(option.value) === selectedCode,
    );

    return (
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>

        <select
          name={groupKey || label}
          value={selectedCode}
          disabled={disabled}
          required={required && !disabled}
          onChange={(event) => {
            if (disabled || !onChange) return;
            onChange(event.target.value);
          }}
          className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        >
          <option value="">{placeholder}</option>
          {selectedCode && !hasSelectedOption && (
            <option value={selectedCode}>{selectedCode}</option>
          )}
          {options.map((option) => {
            const code = String(option.value);
            const name =
              option.label && option.label !== code ? ` - ${option.label}` : "";

            return (
              <option key={option.id} value={code}>
                {code}
                {name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>

      <div
        className="grid grid-cols-2 gap-2"
      >
        {options.map((option, index) => {
          const code = String(option.value);

          const name =
            option.label && option.label !== code ? option.label : "";

          const checked = checkbox
            ? selectedValues.includes(code)
            : String(normalizedValue ?? "") === code;

          const inputRequired = checkbox
            ? required && !disabled && checkboxGroupEmpty && index === 0
            : required && !disabled;

          return (
            <label
              key={option.id}
              className={`flex min-w-0 items-start gap-2 rounded-md border px-2.5 py-2 text-xs transition ${
                disabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
                  : checked
                    ? "cursor-pointer border-blue-400 bg-blue-50 text-blue-900"
                    : "cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <input
                type={checkbox ? "checkbox" : "radio"}
                name={checkbox ? groupKey : label}
                value={code}
                checked={checked}
                disabled={disabled}
                required={inputRequired}
                onChange={(event) => {
                  if (disabled || !onChange) return;

                  if (!checkbox) {
                    onChange(event.target.value);
                    return;
                  }

                  const nextValues = event.target.checked
                    ? [...selectedValues, code]
                    : selectedValues.filter((item) => item !== code);

                  onChange(nextValues);
                }}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-blue-600"
              />

              <span className="min-w-0 wrap-break-word">
                <strong className="font-semibold">{code}</strong>
                {name && <span> {name}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
