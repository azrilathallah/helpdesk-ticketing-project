import Swal from "sweetalert2";

const DEFAULT_OPTIONS = {
  confirmButtonText: "OK",
  buttonsStyling: true,
  allowOutsideClick: false,
  allowEscapeKey: true,
};

export function showNotification(options = {}) {
  return Swal.fire({
    ...DEFAULT_OPTIONS,
    icon: options.icon || "info",
    title: options.title || "Notification",
    text: options.text || "",
    confirmButtonText: options.confirmButtonText || "OK",
    timer: options.timer,
    showConfirmButton: options.showConfirmButton ?? true,
    ...options,
  });
}

export async function showConfirmation(options = {}) {
  const result = await Swal.fire({
    ...DEFAULT_OPTIONS,
    icon: options.icon || "warning",
    title: options.title || "Are you sure?",
    text: options.text || "This action cannot be undone.",
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || "Yes",
    cancelButtonText: options.cancelButtonText || "Cancel",
    reverseButtons: true,
    focusCancel: true,
    ...options,
  });

  return result.isConfirmed;
}
