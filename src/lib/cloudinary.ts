import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY;
const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_KEY || !CLOUDINARY_SECRET) {
  throw new Error(
    "Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, and CLOUDINARY_SECRET environment variables"
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const FOLDER_NAME = "t'day";

export interface UploadOptions {
  folder?: string;
  resource_type?: "auto" | "image" | "video" | "raw";
  public_id?: string;
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
}

export async function uploadImage(
  file: Buffer | string,
  filename: string,
  options: UploadOptions = {}
) {
  try {
    const uploadOptions = {
      folder: options.folder || FOLDER_NAME,
      public_id: options.public_id || filename,
      resource_type: options.resource_type || "auto",
      ...options,
    };

    const result = await cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) throw error;
        return result;
      }
    );

    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error}`);
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error}`);
  }
}

export async function deleteFolder(folderName: string) {
  try {
    const result = await cloudinary.api.delete_folder(folderName);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary folder delete failed: ${error}`);
  }
}

export default cloudinary;
