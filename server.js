import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import crmRoutes from "./routes/crmLeadRoutes.js";
import complaintRoutes from "./routes/customerComplaint.routes.js";
import siteVisitRoutes from "./routes/siteVisit.routes.js";
import serviceRequestRoutes from "./routes/serviceRequest.routes.js";
import schemaRoutes from './routes/schemaRoutes.js';
import dataSyncRoutes from './routes/dataSyncRoutes.js';
import entitiesRoutes from './routes/entitiesRoutes.js';
import termsRoutes from './routes/termsRoutes.js';
import customerRoutes from  "./routes/customer.routes.js"
import vendorRoutes from "./routes/vendor.routes.js";
import authRoutes from "./routes/auth.routes.js"
import portalDocumentRoutes from './routes/portalDocument.routes.js'
import gceoApprovalRoutes from './routes/gceoApproval.routes.js'
import contactRoutes from "./routes/contact.routes.js";

import { getPool } from "./config/mysql.js";

import { connectMongo } from "./config/db.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

connectMongo();

(async () => {
  try {
    const pool = await getPool();
    console.log('connected to local sql');
  } catch (err) {
    console.error('connection failed:', err.message);
    process.exit(1); 
  }
})();

app.use("/api/crm", crmRoutes);
app.use("/api/portal/documents", portalDocumentRoutes);
app.use("/api/gceo", gceoApprovalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/forms", complaintRoutes);
app.use("/api/forms", siteVisitRoutes);
app.use("/api/forms", serviceRequestRoutes);
app.use('/api/schema', schemaRoutes);
app.use('/api/sync', dataSyncRoutes);
app.use('/api/companies', entitiesRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/',customerRoutes);
app.use('/api/',vendorRoutes);
app.use("/api/", contactRoutes);
app.get("/", (req, res) => {
  res.send("backend is running");
});

app.listen(process.env.PORT, () =>
  console.log("Server running on", process.env.PORT),
);
