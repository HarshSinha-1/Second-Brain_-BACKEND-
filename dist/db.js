"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = exports.TagModel = exports.ContentModel = exports.Usermodel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const contentTypes = ['image', 'video', 'article', 'audio'];
const contentSchema = new mongoose_1.Schema({
    link: { type: String, required: true },
    type: { type: String, enum: contentTypes },
    title: { type: String, required: true },
    tags: [{ type: mongoose_1.Types.ObjectId, ref: "Tag" }],
    userId: { type: mongoose_1.Types.ObjectId, ref: "User" }
});
const TagSchema = new mongoose_1.Schema({
    title: { type: String, required: true }
});
const LinkSchema = new mongoose_1.Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, unique: true },
});
exports.Usermodel = (0, mongoose_1.model)("User", userSchema);
exports.ContentModel = (0, mongoose_1.model)("Content", contentSchema);
exports.TagModel = (0, mongoose_1.model)("Tag", TagSchema);
exports.LinkModel = (0, mongoose_1.model)("Link", LinkSchema);
