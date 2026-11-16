export const CLOUDINARY_CLOUD_NAME = 'zm450oii';
export const CLOUDINARY_UPLOAD_PRESET = 'soliman_gold_products';
export const CLOUDINARY_ASSET_FOLDER = 'soliman-gold/products';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const CLOUDINARY_PRODUCT_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  assetFolder?: string;
  originalFilename?: string;
  bytes: number;
  format?: string;
}

export function validateProductImageFile(file: File | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: 'لم يتم اختيار أي ملف صورة.' };
  }

  const fileName = (file.name || '').toLowerCase();
  const mimeType = (file.type || '').toLowerCase();
  const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );
  const hasAllowedMime = mimeType ? ALLOWED_IMAGE_MIME_TYPES.has(mimeType) : false;

  // Enforce strict JPG / PNG / WebP check (MIME if provided, plus extension)
  if ((mimeType && !hasAllowedMime) || (!mimeType && !hasAllowedExtension) || !hasAllowedExtension) {
    return {
      valid: false,
      error: `صيغة الملف "${file.name}" غير مدعومة. المسموح فقط: JPG أو PNG أو WebP.`,
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: `الملف "${file.name}" فارغ أو تالف.`,
    };
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `حجم الصورة "${file.name}" (${sizeInMb} MB) يتجاوز الحد الأقصى المسموح به وهو 5 MB.`,
    };
  }

  return { valid: true };
}

export async function uploadProductImageToCloudinary(
  file: File
): Promise<CloudinaryUploadResult> {
  const validation = validateProductImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'ملف الصورة غير صالح.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  let response: Response;
  try {
    response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error(
      'تعذر الاتصال بخدمة Cloudinary لرفع الصورة. تحقق من الاتصال بالإنترنت ثم حاول مجدداً.'
    );
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    throw new Error('استجابة غير صالحة من خدمة Cloudinary.');
  }

  if (!response.ok) {
    const remoteMsg = data?.error?.message;
    throw new Error(
      remoteMsg
        ? `فشل رفع الصورة إلى Cloudinary: ${remoteMsg}`
        : `فشل رفع الصورة إلى Cloudinary (رمز ${response.status}).`
    );
  }

  if (typeof data?.secure_url !== 'string' || !data.secure_url.startsWith('https://')) {
    throw new Error('لم تُرجع خدمة Cloudinary رابطاً آمناً (secure_url) للصورة.');
  }

  return {
    secureUrl: data.secure_url,
    publicId: String(data.public_id || ''),
    assetFolder: data.asset_folder ? String(data.asset_folder) : undefined,
    originalFilename: data.original_filename
      ? String(data.original_filename)
      : undefined,
    bytes: Number(data.bytes || file.size),
    format: data.format ? String(data.format) : undefined,
  };
}

export function isCloudinaryOrUploadedImage(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/uploads/')) return true;
  if (trimmed.includes('res.cloudinary.com/')) return true;
  return false;
}
