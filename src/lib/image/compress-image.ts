const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 1.5 * 1024 * 1024;
const MAX_DIMENSION = 1600;

export async function compressPetImage(input: File): Promise<File> {
  if (!input.type.startsWith("image/")) {
    throw new Error("اختر ملف صورة صالحًا.");
  }
  if (input.size > MAX_INPUT_BYTES) {
    throw new Error("حجم الصورة الأصلية كبير جدًا. الحد الأقصى 15 ميجابايت.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(input);
  } catch {
    throw new Error("تعذر فتح الصورة. جرّب صورة بصيغة JPG أو PNG أو WebP.");
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("المتصفح لا يدعم معالجة الصور.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let blob: Blob | null = null;
    for (const quality of [0.82, 0.72, 0.62, 0.52]) {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= MAX_OUTPUT_BYTES) break;
    }

    if (!blob) throw new Error("تعذر ضغط الصورة.");
    const baseName = input.name.replace(/\.[^.]+$/, "") || "pet-photo";
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}
