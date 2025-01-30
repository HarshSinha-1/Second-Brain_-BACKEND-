"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const zod_1 = require("zod");
const express_1 = require("express");
const config_1 = require("./config");
const user_middleware_1 = require("./user.middleware");
const utils_1 = __importDefault(require("./utils"));
const router = (0, express_1.Router)();
/** Password regex for validation */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;
const userSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(10),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
});
// Signup route
//@ts-ignore
router.post("/brain/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const bcrypt = yield Promise.resolve().then(() => __importStar(require("bcrypt")));
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(411).json({
            message: "Incorrect Input Format",
        });
    }
    const { username, password } = validation.data;
    try {
        const ExistUser = yield db_1.Usermodel.findOne({ username });
        if (ExistUser) {
            return res.status(403).json({
                message: "User already exists with this Username",
            });
        }
        const hashpwd = bcrypt.hashSync(password, 8);
        const UserObj = {
            username: username,
            password: hashpwd,
        };
        const User_created = yield db_1.Usermodel.create(UserObj);
        res.status(200).json({
            user: User_created,
            message: "User created Successfully",
        });
    }
    catch (error) {
        console.error("Error while registering the user:", error);
        res.status(500).json({
            message: "Error while Registering the user",
        });
    }
}));
// Signin route
//@ts-ignore
router.post("/brain/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const bcrypt = yield Promise.resolve().then(() => __importStar(require("bcrypt")));
        const validation = userSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(411).json({
                message: "Incorrect Input Format",
            });
        }
        const { username, password } = validation.data;
        const user = yield db_1.Usermodel.findOne({ username });
        if (!user) {
            return res.status(403).json({
                message: "Invalid Username",
            });
        }
        const IspwdValid = yield bcrypt.compareSync(password, user.password);
        if (!IspwdValid) {
            return res.status(403).json({
                message: "Incorrect Password",
            });
        }
        // JWT with TTL
        const token = jsonwebtoken_1.default.sign({ username, id: user._id }, config_1.JWT_password, {
            expiresIn: "1h",
        });
        res.status(200).json({
            token,
            message: "Signed In Successfully!",
        });
    }
    catch (error) {
        console.error("Error during sign in:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
//@ts-ignore
router.post("/brain/api/v1/content", user_middleware_1.usermiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.get("/brain/api/v1/content", user_middleware_1.usermiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const content = yield db_1.ContentModel.find({ userId }).populate("userId", "username");
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
// Placeholder for other routes
//@ts-ignore
router.delete("/brain/api/v1/content", user_middleware_1.usermiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        const userId = req.body.userId;
        const content = yield db_1.ContentModel.findOneAndDelete({ _id: contentId, userId });
        if (!content) {
            return res.status(403).send({
                message: "Content Not Found for this User",
            });
        }
        res.status(200).json({ message: "Content deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
router.post("/brain/api/v1/share", user_middleware_1.usermiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { share, userId } = req.body; // Correctly extract the fields
        if (typeof share !== "boolean" || !userId) {
            return res.status(400).json({
                message: "Invalid request body. 'share' must be a boolean and 'userId' is required.",
            });
        }
        if (share) {
            try {
                const hash = (0, utils_1.default)(10); // Ensure genHashvalue works as expected
                const link = yield db_1.LinkModel.create({
                    hash: hash,
                    userId: userId,
                });
                return res.status(200).json({
                    sharelink: hash,
                    link: `http://localhost:3000/brain/api/v1/${hash}`,
                    message: "Link created successfully",
                });
            }
            catch (error) {
                console.error("Error creating share link:", error); // Log error details
                return res.status(500).json({
                    message: "Error while creating the link",
                    //@ts-ignore
                    error: error.message || error,
                });
            }
        }
        else {
            try {
                const deletelink = yield db_1.LinkModel.findOneAndDelete({ userId });
                if (!deletelink) {
                    return res.status(404).json({
                        message: "Sharelink not found",
                    });
                }
                return res.status(200).json({
                    message: "Link deleted successfully",
                });
            }
            catch (error) {
                console.error("Error deleting share link:", error); // Log error details
                return res.status(500).json({
                    message: "Error while deleting the link",
                    //@ts-ignore
                    error: error.message || error,
                });
            }
        }
    }
    catch (error) {
        console.error("Internal Server Error:", error); // Log error details
        return res.status(500).json({
            message: "Internal Server Error",
            //@ts-ignore
            error: error.message || error,
        });
    }
}));
router.get("/brain/api/v1/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shareLink } = req.params;
        const link = yield db_1.LinkModel.findOne({ hash: shareLink });
        if (!link) {
            return res.status(403).json({
                message: "Link Not Found"
            });
        }
        const userId = link.userId;
        const content = yield db_1.ContentModel.findOne({ userId: userId }).populate("userId", "username");
        if (!content) {
            return res.status(403).json({
                message: "Content Not Found"
            });
        }
        return res.status(200).json({
            content: content,
            message: "Content fetched successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error
        });
    }
}));
exports.default = router;
