import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from './env';
import { logger } from '../utils/logger';

let configured = false;

const ensureConfigured = (): void => {
  if (configured) return;
  if (!env.cloudinary.cloudName) {
    logger.warn('Cloudinary not configured — uploads will fail');
    return;
  }
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  configured = true;
};

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<UploadResult> => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (err, result: UploadApiResponse | undefined) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
};
