import mongoose from "mongoose";

const AuthTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    expiresOn: { type: Number, required: true }, 
  },
  { timestamps: true }
);

export default mongoose.model("AuthToken", AuthTokenSchema);
