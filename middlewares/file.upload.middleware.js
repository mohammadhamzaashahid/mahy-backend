import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/storage/uploads/original");
  },

  filename: function (req, file, cb) {
    const unique = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);

    const filename = `${Date.now()}_${unique}${ext}`;

    cb(null, filename);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF documents allowed"));
    }

    cb(null, true);
  },
});