import express from "express";
import {
  getCurrencies,
  getPaymentTerms,
  getDeliveryTerms,
  getTaxGroups,
  getDlvModes,
  getCustomerPaymentMethods,
  getLineOfBusiness,
  getZipCodes
} from "../controllers/termsController.js";

const router = express.Router();

router.get("/payment-terms", getPaymentTerms);
router.get("/currencies", getCurrencies);
router.get("/delivery-terms", getDeliveryTerms);
router.get("/tax-groups", getTaxGroups);
router.get('/dlv-modes', getDlvModes);
router.get('/customer-payment-methods', getCustomerPaymentMethods);
router.get('/line-of-business', getLineOfBusiness);
router.get('/zip-codes',getZipCodes);

export default router;
