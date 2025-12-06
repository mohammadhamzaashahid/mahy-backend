import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongo } from "./src/config/db.js";
import crmRoutes from "./src/routes/crmLeadRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectMongo();

app.use("/api/crm", crmRoutes);

app.get('/', (req,res) => {
    res.send("backend is running");
})


app.listen(process.env.PORT, () =>
  console.log("Server running on", process.env.PORT)
);
