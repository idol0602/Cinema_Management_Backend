import QRCode from "qrcode";

/**
 * Generate QR code as data URL (base64)
 * @param {string} token - Data to encode in QR code
 * @returns {Promise<string>} - Base64 data URL
 */
export const generateQrCode = (token) => {
  return QRCode.toDataURL(token, {
    type: "png",
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
    width: 300,
    margin: 2,
  });
};

/**
 * Generate QR code as Buffer for Cloudinary upload
 * @param {string} token - Data to encode in QR code
 * @returns {Promise<Buffer>} - PNG buffer
 */
export const generateQrBuffer = async (token) => {
  return QRCode.toBuffer(token, {
    type: "png",
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
    width: 300,
    margin: 2,
  });
};

export default {
  generateQrCode,
  generateQrBuffer,
};