import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

const isServerless =
  process.env.VERCEL === "1" ||
  !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
  !!process.env.LAMBDA_TASK_ROOT;

const baseUploadDir = isServerless
  ? path.join(os.tmpdir(), "uploads")
  : path.resolve(process.cwd(), "uploads");

const uploadDir = path.join(baseUploadDir, "temp");

let canUseDiskStorage = true;
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  canUseDiskStorage = false;
  console.error(
    "[upload.middleware] Failed to prepare upload dir:",
    uploadDir,
    error,
  );
}

const storage = canUseDiskStorage
  ? multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    })
  : multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed"), false);
  }
};

export const uploadExcel = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
