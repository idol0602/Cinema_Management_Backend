import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudary.js";

/**
 * Create a multer upload middleware for a specific folder
 * @param {string} folder - Cloudinary folder name
 * @returns {multer.Multer}
 */
const createUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
    },
  });
  return multer({ storage });
};

// Pre-configured uploaders for each entity type
export const movieUpload = createUploader("cinema_movies");
export const comboUpload = createUploader("cinema_combos");
export const eventUpload = createUploader("cinema_events");
export const menuItemUpload = createUploader("cinema_menu_items");
export const slideUpload = createUploader("cinema_slides");
export const postUpload = createUploader("cinema_posts");
export const ticketUpload = createUploader("cinema_tickets");

// Generic uploader (for backward compatibility)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cinema_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
  },
});

const upload = multer({ storage });

/**
 * Delete an image from Cloudinary by its public_id
 * @param {string} publicId - Cloudinary public_id
 */
const destroy = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

export default { upload, destroy };
