/**
 * Cloudinary utility for image uploads
 * Uses unsigned upload with preset for client-side uploads
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME) {
  console.warn("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
}

if (!UPLOAD_PRESET) {
  console.warn("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set");
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload an image to Cloudinary using unsigned upload preset
 * This can be called from both client and server components
 */
export async function uploadToCloudinary(
  file: File,
  options?: {
    folder?: string;
    transformation?: string;
  }
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  if (options?.transformation) {
    formData.append("transformation", options.transformation);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to upload image to Cloudinary");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options?: {
    folder?: string;
    transformation?: string;
  }
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Cloudinary (server-side only)
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!API_KEY || !API_SECRET || !CLOUD_NAME) {
    throw new Error("Cloudinary API credentials are missing");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateCloudinarySignature(
    { public_id: publicId, timestamp },
    API_SECRET
  );

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("signature", signature);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp.toString());

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to delete image from Cloudinary");
  }
}

/**
 * Generate Cloudinary signature for authenticated requests
 */
async function generateCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  const crypto = await import("crypto");
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(sortedParams + apiSecret)
    .digest("hex");
}