import { getPool } from "../config/mysql.js";

export const createDocumentRecord = async (data) => {

  const pool = await getPool();

  const [result] = await pool.query(
    `
    INSERT INTO portal_documents
    (
      documentUuid,
      documentType,
      userReferenceNo,
      amount,
      description,
      severity,
      urgency,
      remarks,

      originalFileName,
      storedOriginalName,
      originalFilePath,

      mimeType,
      fileSize,
      uploadedByEmail,
      department,
      company
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    data
  );

  return result.insertId;
};


export const getDocumentsByUser = async (email) => {
  const pool = await getPool();

  const [rows] = await pool.query(
    `
    SELECT
      id,
      referenceNo,
      documentType,
      userReferenceNo,
      amount,
      severity,
      urgency,
      status,
      decisionRemarks,
      createdAt,
      approvedAt,
      rejectedAt
    FROM portal_documents
    WHERE uploadedByEmail = ?
    ORDER BY createdAt DESC
    `,
    [email]
  );

  return rows;
};

export const getAllDocuments = async (status) => {
  const pool = await getPool();

  let sql = `
  SELECT
    id,
    referenceNo,
    documentType,
    userReferenceNo,
    amount,
    severity,
    urgency,
    uploadedByEmail,
    department,
    company,
    description,
    status,
    decisionRemarks,
    approvedAt,
    rejectedAt,
    createdAt,
    remarks
  FROM portal_documents
  `;

  if (status) {
    sql += ` WHERE status = ?`;
  }

  sql += ` ORDER BY createdAt DESC`;

  const [rows] = await pool.query(sql, status ? [status] : []);
  return rows;
};


export const updateDocumentStatus = async (id, status, actionUser) => {
  const pool = await getPool();

  if (status === "APPROVED") {
    await pool.query(
      `
      UPDATE portal_documents
      SET
        status='APPROVED',
        approvedByEmail=?,
        approvedAt=NOW()
      WHERE id=?
      `,
      [actionUser.email, id],
    );
  }

  if (status === "REJECTED") {
    await pool.query(
      `
      UPDATE portal_documents
      SET
        status='REJECTED',
        rejectedByEmail=?,
        rejectedAt=NOW()
      WHERE id=?
      `,
      [actionUser.email, id],
    );
  }
};

export const createActionLog = async (
  documentId,
  actionType,
  actionUser,
  remarks,
) => {
  const pool = await getPool();

  await pool.query(
    `
    INSERT INTO portal_document_actions
    (
      documentId,
      actionType,
      actionByName,
      actionByEmail,
      remarks
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [documentId, actionType, actionUser.name, actionUser.email, remarks],
  );
};



export const getDocumentById = async (id) => {
  const pool = await getPool();

  const [rows] = await pool.query(
    `
    SELECT *
    FROM portal_documents
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

export const finalizeDocumentDecision = async ({
  id,
  status,
  actionUser,
  decisionRemarks,
  processedFileName,
  processedFilePath,
  verificationToken,
  verificationUrl,
  qrCodePath,
}) => {
  const pool = await getPool();

  if (status === "APPROVED") {
    await pool.query(
      `
      UPDATE portal_documents
      SET
        status = 'APPROVED',
        decisionRemarks = ?,
        approvedByName = ?,
        approvedByEmail = ?,
        approvedAt = NOW(),
        processedFileName = ?,
        processedFilePath = ?,
        verificationToken = ?,
        verificationUrl = ?,
        qrCodePath = ?,
        processedAt = NOW()
      WHERE id = ?
      `,
      [
        decisionRemarks || null,
        actionUser.name,
        actionUser.email,
        processedFileName,
        processedFilePath,
        verificationToken,
        verificationUrl,
        qrCodePath,
        id,
      ]
    );
  }

  if (status === "REJECTED") {
    await pool.query(
      `
      UPDATE portal_documents
      SET
        status = 'REJECTED',
        rejectionReason = ?,
        decisionRemarks = ?,
        rejectedByName = ?,
        rejectedByEmail = ?,
        rejectedAt = NOW(),
        processedFileName = ?,
        processedFilePath = ?,
        verificationToken = NULL,
        verificationUrl = NULL,
        qrCodePath = NULL,
        processedAt = NOW()
      WHERE id = ?
      `,
      [
        decisionRemarks || null,
        decisionRemarks || null,
        actionUser.name,
        actionUser.email,
        processedFileName,
        processedFilePath,
        id,
      ]
    );
  }
};