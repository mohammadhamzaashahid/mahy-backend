export const d365encodeFileToBase64 = (file) => ({
  Name: file.originalname,
  Base64str: file.buffer.toString("base64"),
  Extension: `.${file.originalname.split(".").pop()}`,
  Notes: file.originalname,
});