import express from "express";
import mongoose from "mongoose";
import  router  from "./auth.userRoute";
import { MONGO_URL } from "./config";
 
//import { Router } from "express";

async function setupApp() {
  // const { router: authRouter } = await import("./auth.userRoute");

  const app = express();
  app.use(express.json());
  app.use("/", router);
   

  app.listen( 3000, () => console.log("Server started at port :3000"));
}

async function connectDB() {
    try {
      await mongoose.connect(MONGO_URL);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    } 
}
connectDB();
setupApp();

/**
 *
 * {
    "username": "harsh",
    "password" : "Sinha$745"
}
 */