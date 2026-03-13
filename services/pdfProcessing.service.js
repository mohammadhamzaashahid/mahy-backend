import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import QRCode from "qrcode";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

const PROCESSED_DIR = path.resolve("src/storage/uploads/processed");
const QR_DIR = path.resolve("src/storage/qr");

await fs.mkdir(PROCESSED_DIR, { recursive: true });
await fs.mkdir(QR_DIR, { recursive: true });

const WATERMARK_CONFIG = {
  APPROVED: {
    text: "APPROVED",
  },
  REJECTED: {
    text: "REJECTED",
  },
};

const buildVerificationUrl = (token) => {
  return `${process.env.APP_BASE_URL}/verify/${token}`;
};

export const processDocumentPdf = async ({
  originalFilePath,
  originalFileName,
  referenceNo,
  status,
}) => {
  const sourceBytes = await fs.readFile(path.resolve(originalFilePath));
  const pdfDoc = await PDFDocument.load(sourceBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  const watermarkText = WATERMARK_CONFIG[status].text;

  let verificationToken = null;
  let verificationUrl = null;
  let qrCodePath = null;
  let qrImage = null;

  if (status === "APPROVED") {
    verificationToken = crypto.randomBytes(24).toString("hex");
    verificationUrl = buildVerificationUrl(verificationToken);

    const qrPngDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 220,
    });

    const base64 = qrPngDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(base64, "base64");

    const qrFileName = `${referenceNo}-${verificationToken}.png`;
    qrCodePath = path.join(QR_DIR, qrFileName);

    await fs.writeFile(qrCodePath, qrBuffer);
    qrImage = await pdfDoc.embedPng(qrBuffer);
  }

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    const { width, height } = page.getSize();

    const fontSize = Math.max(65, Math.min(width, height) / 5.5);

    const centerX = width / 2;
    const centerY = height / 2;

    page.drawText(watermarkText, {
      x: centerX - fontSize * 2,
      y: centerY,
      size: fontSize,
      font,
      color: rgb(0.75, 0.75, 0.75),
      rotate: degrees(45),
      opacity: 0.18,
    });

    page.drawText(watermarkText, {
      x: centerX - fontSize * 2,
      y: centerY - fontSize * 1.4,
      size: fontSize,
      font,
      color: rgb(0.75, 0.75, 0.75),
      rotate: degrees(45),
      opacity: 0.18,
    });

    if (status === "APPROVED" && qrImage && index === 0) {
      const qrSize = Math.min(110, width * 0.18);
      page.drawImage(qrImage, {
        x: width - qrSize - 24,
        y: 24,
        width: qrSize,
        height: qrSize,
        opacity: 0.95,
      });

      page.drawText(`Ref: ${referenceNo}`, {
        x: 24,
        y: 28,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
  }

  const processedFileName = `${path.parse(originalFileName).name}-${status.toLowerCase()}.pdf`;
  const processedFilePath = path.join(PROCESSED_DIR, processedFileName);

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(processedFilePath, pdfBytes);

  return {
    processedFileName,
    processedFilePath,
    verificationToken,
    verificationUrl,
    qrCodePath,
  };
};
