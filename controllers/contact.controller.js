import { sendContactEmail } from "../services/contact.service.js";


export const handleContactForm = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      companyName,
      companyWebsite,
      businessEmail,
      mobileNumber,
      country,
      enquiryType,
      message,
      agreed,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !businessEmail ||
      !mobileNumber ||
      !country ||
      !enquiryType ||
      agreed !== true
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    await sendContactEmail({
      firstName,
      lastName,
      companyName,
      companyWebsite,
      businessEmail,
      mobileNumber,
      country,
      enquiryType,
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully",
    });
  } catch (err) {
    console.error("Contact Form Error:", err.message);

    return res.status(500).json({
      success: false,
      error: "Failed to process enquiry",
    });
  }
};