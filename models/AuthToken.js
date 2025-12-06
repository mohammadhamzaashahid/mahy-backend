import mongoose from "mongoose";

const AuthTokenSchema = new mongoose.Schema({
  token: String,
  expiresOn: Number,
});

export default mongoose.model("AuthToken", AuthTokenSchema);
