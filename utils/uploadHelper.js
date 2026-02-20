export const encodeFileToBase64 = (file) => ({
  fileName: file.originalname,   
  mimeType: file.mimetype,     
  base64: file.buffer.toString("base64"),
});