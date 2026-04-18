import crypto from "crypto";
import path from "path";
import fs from "fs";
import { generateReference } from "../utils/documents/generateReference.js";
import { error, success } from "../utils/response.js";
import {
  createDocumentRecord,
  getDocumentById,
  getDocumentsByUser,
} from "../services/document.service.js";
import { getPool } from "../config/mysql.js";
import { log } from "console";

export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return error(res, "No file uploaded", 400);
    }

    const {
      documentType,
      amount,
      referenceNo,
      description,
      severity,
      urgency,
      remarks,
      uploadedByEmail,
      department,
      company,
    } = req.body;

    console.log(referenceNo);
    
    const documentUuid = crypto.randomUUID();

    const insertId = await createDocumentRecord([
      documentUuid,
      documentType,
      referenceNo,

      amount || null,
      description || null,
      severity || null,
      urgency || null,
      remarks || null,

      file.originalname,
      file.filename,
      file.path,

      file.mimetype,
      file.size,
      uploadedByEmail,
      department,
      company,
    ]);

    const reference = generateReference(insertId);

    const pool = await getPool();

    await pool.query(`UPDATE portal_documents SET referenceNo=? WHERE id=?`, [
      reference,
      insertId,
    ]);

    return success(res, {
      documentId: insertId,
      referenceNo: reference,
      status: "PENDING",
    });
  } catch (err) {
    console.error(err);
    return error(res, "Upload failed");
  }
};

export const getMyDocuments = async (req, res) => {
  try {

    const email = req.query.email;
console.log(email);

    const docs = await getDocumentsByUser(email);

    return success(res, docs);
  } catch (err) {
    console.error(err);

    return error(res);
  }
};

export const verifyDocument = async (req, res) => {
  try {
    const { token } = req.params;

    const pool = await getPool();

    const [rows] = await pool.query(
      `
      SELECT
        referenceNo,
        documentType,
        status,
        approvedAt,
        company,
        department,
        uploadedByEmail
      FROM portal_documents
      WHERE verificationToken = ?
      LIMIT 1
      `,
      [token]
    );

    if (!rows.length) {
      return error(res, "Invalid verification token", 404);
    }

    return success(res, rows[0]);

  } catch (err) {
    console.error(err);
    return error(res);
  }
};



export const getPublicDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await getDocumentById(id);

    if (!doc) {
      return error(res, "Document not found", 404);
    }

    return success(res, {
      id: doc.id,
      referenceNo: doc.referenceNo,
      documentType: doc.documentType,
      status: doc.status,
      uploadedByEmail: doc.uploadedByEmail,
      createdAt: doc.createdAt,
      approvedAt: doc.approvedAt,
      rejectedAt: doc.rejectedAt
    });

  } catch (err) {
    console.error(err);
    return error(res);
  }
};


export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();

    const [rows] = await pool.query(
      `SELECT processedFilePath, originalFilePath
       FROM portal_documents
       WHERE id=?`,
      [id],
    );

    const doc = rows[0];



    if (!rows.length) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!doc.processedFilePath && !doc.originalFilePath) {
  return res.status(404).json({ message: "File not found" });
}

    const filePath = rows[0].processedFilePath || rows[0].originalFilePath;

    return res.download(path.resolve(filePath));
  } catch (err) {
    console.error(err);

    return res.status(500).json({ message: "Download failed" });
  }
};
