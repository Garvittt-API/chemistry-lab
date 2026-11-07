"use client";

export function triggerBlobDownload(
  content: string | Uint8Array,
  mimeType: string,
  filename: string,
): void {
  const part =
    typeof content === "string"
      ? content
      : new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
  const blob = new Blob([part as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}
