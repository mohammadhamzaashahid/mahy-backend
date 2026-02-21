import mongoose from "mongoose";

const FinOpsTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    expiresOn: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("FinOpsToken", FinOpsTokenSchema);