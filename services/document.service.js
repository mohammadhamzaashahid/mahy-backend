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

export const getDocumentsByUser = async ({
  email,
  page = 1,
  limit = 10,
}) => {
  const pool = await getPool();

  const offset = (page - 1) * limit;
  const [countResult] = await pool.query(
    `
    SELECT COUNT(*) as total
    FROM portal_documents
    WHERE uploadedByEmail = ?
    `,
    [email]
  );

  const total = countResult[0]?.total || 0;

  const [rows] = await pool.query(
    `
    SELECT
      *
    FROM portal_documents
    WHERE uploadedByEmail = ?
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
    `,
    [email, Number(limit), Number(offset)]
  );

  return {
    data: rows,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};


// export const getDocumentsByUser = async (email) => {
//   const pool = await getPool();

//   const [rows] = await pool.query(
//     `
//     SELECT
//       *
//     FROM portal_documents
//     WHERE uploadedByEmail = ?
//     ORDER BY createdAt DESC
//     `,
//     [email]
//   );

//   return rows;
// };

export const getAllDocuments = async ({ status, page = 1, limit = 10 }) => {
  const pool = await getPool();

  const offset = (page - 1) * limit;

  let baseQuery = `
    FROM portal_documents
  `;

  let whereClause = "";
  let params = [];

  if (status) {
    whereClause = ` WHERE status = ?`;
    params.push(status);
  }

  const countSql = `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`;
  const [countResult] = await pool.query(countSql, params);
  const total = countResult[0]?.total || 0;

const totalAllSql = `SELECT COUNT(*) as total FROM portal_documents`;
const [totalAllResult] = await pool.query(totalAllSql);
const totalAll = totalAllResult[0]?.total || 0;

  const dataSql = `
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
    ${baseQuery}
    ${whereClause}
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(dataSql, [...params, Number(limit), Number(offset)]);

  return {
    data: rows,
    pagination: {
      total,
      totalAll,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

//without pagination old code
// export const getAllDocuments = async (status) => {
//   const pool = await getPool();

//   let sql = `
//   SELECT
//     id,
//     referenceNo,
//     documentType,
//     userReferenceNo,
//     amount,
//     severity,
//     urgency,
//     uploadedByEmail,
//     department,
//     company,
//     description,
//     status,
//     decisionRemarks,
//     approvedAt,
//     rejectedAt,
//     createdAt,
//     remarks
//   FROM portal_documents
//   `;

//   if (status) {
//     sql += ` WHERE status = ?`;
//   }

//   sql += ` ORDER BY createdAt DESC`;

//   const [rows] = await pool.query(sql, status ? [status] : []);
//   return rows;
// };


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