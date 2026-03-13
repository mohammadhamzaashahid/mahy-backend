export const generateReference = (id) => {
  const year = new Date().getFullYear();
  const padded = String(id).padStart(5, "0");

  return `DOC-${year}-${padded}`;
};