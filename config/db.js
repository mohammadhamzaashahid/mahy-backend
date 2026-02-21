import mongoose from "mongoose";

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongo db connected");
  } catch (err) {
    console.error("db error", err);
  }
};
