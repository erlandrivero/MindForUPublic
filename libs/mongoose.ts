import mongoose from "mongoose";
import User from "@/models/User";

const connectMongo = async () => {
  console.time('connectMongo');
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }
  const connection = await mongoose
    .connect(process.env.MONGODB_URI as string)
    .catch((e) => console.error("Mongoose Client Error: " + e.message));
  console.timeEnd('connectMongo');
  return connection;
};

export default connectMongo;
