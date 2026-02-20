import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import crmRoutes from "./routes/crmLeadRoutes.js";
import complaintRoutes from "./routes/customerComplaint.routes.js";
import siteVisitRoutes from "./routes/siteVisit.routes.js";
import serviceRequestRoutes from "./routes/serviceRequest.routes.js";

import { connectMongo } from "./config/db.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

connectMongo();

app.use("/api/crm", crmRoutes);
app.use("/api/forms", complaintRoutes);
app.use("/api/forms", siteVisitRoutes);
app.use("/api/forms", serviceRequestRoutes);

app.get("/", (req, res) => {
  res.send("backend is running");
});

app.listen(process.env.PORT, () =>
  console.log("Server running on", process.env.PORT),
);
