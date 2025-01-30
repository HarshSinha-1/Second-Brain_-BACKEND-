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
exports.usermiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const usermiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(403).send({
                message: "Authorization Token Not Passed",
            });
        }
        const verifytoken = yield jsonwebtoken_1.default.verify(token, config_1.JWT_password);
        if (verifytoken) {
            //@ts-ignore
            req.username = verifytoken.username;
            //@ts-ignore
            req.body.userId = verifytoken.id;
            return next();
        }
        else {
            return res.status(403).send({
                message: "You are not Signed In",
            });
        }
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Error UM",
            error: error,
        });
    }
});
exports.usermiddleware = usermiddleware;
