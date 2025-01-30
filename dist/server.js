"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_userRoute_1 = __importDefault(require("./auth.userRoute"));
//import { Router } from "express";
function setupApp() {
    return __awaiter(this, void 0, void 0, function* () {
        // const { router: authRouter } = await import("./auth.userRoute");
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use("/", auth_userRoute_1.default);
        app.listen(3000, () => console.log("Server started at port :3000"));
    });
}
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect("mongodb+srv://harshsinha969:Sinha%40234@cluster0.xhebw.mongodb.net/myDatabaseName?retryWrites=true&w=majority&appName=Cluster0");
            console.log("Connected to MongoDB");
        }
        catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    });
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
