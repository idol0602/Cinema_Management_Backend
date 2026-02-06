import cloudinary from "../config/cloudary.js";

/**
 * Upload a file buffer or stream to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} [publicId] - Optional custom public ID
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadBuffer = async (buffer, folder, publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "image",
    };
    
    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Upload a base64 encoded image to Cloudinary
 * @param {string} base64Data - Base64 encoded image data (with or without data URI prefix)
 * @param {string} folder - Cloudinary folder name
 * @param {string} [publicId] - Optional custom public ID
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadBase64 = async (base64Data, folder, publicId = null) => {
  try {
    // Ensure base64Data has proper data URI prefix
    let dataUri = base64Data;
    if (!base64Data.startsWith("data:")) {
      dataUri = `data:image/png;base64,${base64Data}`;
    }

    const uploadOptions = {
      folder,
      resource_type: "image",
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicIdOrUrl - Cloudinary public_id or URL
 * @returns {Promise<void>}
 */
export const deleteImage = async (publicIdOrUrl) => {
  try {
    let publicId = publicIdOrUrl;
    
    // If it's a URL, extract the public_id
    if (publicIdOrUrl && publicIdOrUrl.includes("cloudinary.com")) {
      publicId = getPublicIdFromUrl(publicIdOrUrl);
    }

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    // Don't throw - deletion failure shouldn't break the main operation
  }
};

/**
 * Extract public_id from a Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not a valid Cloudinary URL
 */
export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) {
    return null;
  }

  try {
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{extension}
    const urlParts = url.split("/upload/");
    if (urlParts.length < 2) return null;

    const pathAfterUpload = urlParts[1];
    // Remove version (v123456789/) if present
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
    
    return publicId;
  } catch {
    return null;
  }
};

export default {
  uploadBuffer,
  uploadBase64,
  deleteImage,
  getPublicIdFromUrl,
};
