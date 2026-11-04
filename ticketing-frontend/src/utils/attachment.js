import api from "../api/axios";

export const MAX_ATTACHMENTS = 1;

export const isNewAttachment = (file) =>
  typeof File !== "undefined" && file instanceof File;

export function appendAttachments(formData, attachments = []) {
  const keep = [];

  attachments.forEach((file) => {
    if (isNewAttachment(file)) {
      formData.append("attachments[]", file);
    } else if (Number.isInteger(file?.index)) {
      keep.push(file.index);
    }
  });

  formData.append("keep_attachments", JSON.stringify(keep));
}

const PREVIEWABLE_MIME = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
];

const PREVIEWABLE_EXT = [
  "pdf", "png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "txt", "csv", "json",
];

const getExtension = (name = "") => {
  const parts = String(name).toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
};

export const isPreviewable = (file = {}) => {
  const type = String(file.type || "").toLowerCase();

  if (type.startsWith("image/") || PREVIEWABLE_MIME.includes(type)) return true;

  return PREVIEWABLE_EXT.includes(getExtension(file.name));
};

const readBlobError = async (err) => {
  const data = err?.response?.data;

  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text());
      return json?.message;
    } catch {
      return null;
    }
  }

  return data?.message;
};

const fetchAttachmentBlob = async (file) => {
  if (!file?.url) throw new Error("Attachment URL is not available.");

  try {
    const response = await api.get(file.url, { responseType: "blob" });
    const type =
      file.type || response.headers?.["content-type"] || "application/octet-stream";

    return new Blob([response.data], { type });
  } catch (err) {
    const message = await readBlobError(err);
    throw new Error(message || "Failed to load the attachment.", { cause: err });
  }
};

const triggerDownload = (blobUrl, fileName) => {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName || "attachment";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const revokeLater = (blobUrl) => setTimeout(() => URL.revokeObjectURL(blobUrl), 20_000);

export async function downloadAttachment(file) {
  const blob = await fetchAttachmentBlob(file);
  const blobUrl = URL.createObjectURL(blob);

  triggerDownload(blobUrl, file.name);
  revokeLater(blobUrl);
}

export async function openAttachment(file) {
  if (!isPreviewable(file)) {
    return downloadAttachment(file);
  }

  const newTab = window.open("", "_blank");

  try {
    const blob = await fetchAttachmentBlob(file);
    const blobUrl = URL.createObjectURL(blob);

    if (newTab) {
      newTab.location.href = blobUrl;
    } else {
      triggerDownload(blobUrl, file.name);
    }

    revokeLater(blobUrl);
  } catch (err) {
    newTab?.close();
    throw err;
  }
}

