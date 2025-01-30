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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const express_1 = require("express");
const user_middleware_1 = require("./user.middleware");
const contentrouter = (0, express_1.Router)();
//@ts-ignore
contentrouter.post("/brain/api/v1/content", user_middleware_1.usermiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, link, title, tags, userId } = req.body;
        const content = { type, link, title, tags, userId };
        const contentCreated = yield db_1.ContentModel.create(content);
        if (!contentCreated) {
            return res.status(403).send({
                message: "Internal Error/Content Not Created",
            });
        }
        return res.status(200).send({
            message: "Content Created Successfully",
            contentId: contentCreated._id,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error,
        });
    }
}));
//@ts-ignore
contentrouter.get("/brain/api/v1/content", user_middleware_1.usermiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const content = yield db_1.ContentModel.find({ userId }).populate("userId");
        if (!content || content.length === 0) {
            return res.status(403).send({
                message: "Content Not Found for this User",
            });
        }
        return res.status(200).json({
            content,
            message: "Content fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error,
        });
    }
}));
exports.default = contentrouter;
