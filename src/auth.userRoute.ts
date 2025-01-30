import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, Usermodel } from "./db";
import { z } from "zod";
import { Router } from "express";
import { JWT_password } from "./config";
import { usermiddleware } from "./user.middleware";
import  genHashvalue from "./utils"

const router = Router();

/** Password regex for validation */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;
const userSchema = z.object({
    username: z.string().min(3).max(10),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(
            passwordRegex,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
});

// Signup route
//@ts-ignore
router.post("/brain/api/v1/signup", async (req, res) => {
    //@ts-ignore
    const bcrypt = await import("bcrypt");
    const validation = userSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(411).json({
            message: "Incorrect Input Format",
        });
    }

    const { username, password } = validation.data;

    try {
        const ExistUser = await Usermodel.findOne({ username });
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

        const User_created = await Usermodel.create(UserObj);

        res.status(200).json({
            user: User_created,
            message: "User created Successfully",
        });
    } catch (error) {
        console.error("Error while registering the user:", error);

        res.status(500).json({
            message: "Error while Registering the user",
        });
    }
});

// Signin route
//@ts-ignore
router.post("/brain/api/v1/signin", async (req, res) => {
    try {
        // @ts-ignore
        const bcrypt = await import("bcrypt");
        const validation = userSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(411).json({
                message: "Incorrect Input Format",
            });
        }

        const { username, password } = validation.data;

        const user = await Usermodel.findOne({ username });

        if (!user) {
            return res.status(403).json({
                message: "Invalid Username",
            });
        }

        const IspwdValid = await bcrypt.compareSync(password, user.password);

        if (!IspwdValid) {
            return res.status(403).json({
                message: "Incorrect Password",
            });
        }

        // JWT with TTL
        const token = jwt.sign({ username, id: user._id }, JWT_password, {
            expiresIn: "1h",
        });
        res.status(200).json({
            token,
            message: "Signed In Successfully!",
        });
    } catch (error) {
        console.error("Error during sign in:", error);
            res.status(500).json({
            message: "Internal server error",
        });
    }
});


//@ts-ignore
router.post("/brain/api/v1/content", usermiddleware, async (req, res) => {
    try {
        const { type, link, title, tags, userId } = req.body;

        const content = { type, link, title, tags, userId };

        const contentCreated = await ContentModel.create(content);

        if (!contentCreated) {
            return res.status(403).send({
                message: "Internal Error/Content Not Created",
            });
        }

        return res.status(200).send({
            message: "Content Created Successfully",
            contentId: contentCreated._id,
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error,
        });
    }
});
//@ts-ignore
router.get("/brain/api/v1/content", usermiddleware, async (req, res) => {
    try {
        const { userId } = req.body;
        const content = await ContentModel.find({ userId }).populate("userId", "username");

        if (!content || content.length === 0) {
            return res.status(403).send({
                message: "Content Not Found for this User",
            });
        }

        return res.status(200).json({
            content,
            message: "Content fetched successfully",
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error,
        });
    }
});



// Placeholder for other routes
//@ts-ignore
router.delete("/brain/api/v1/content",usermiddleware,async (req, res) => {
    try{  
        const { contentId } = req.body;
        const userId = req.body.userId;
        const content = await ContentModel.findOneAndDelete({ _id: contentId, userId }); 
        if (!content) {
            return res.status(403).send({
                message: "Content Not Found for this User",
            });
        }
    
    res.status(200).json({ message: "Content deleted successfully" });
    }catch(error){
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/brain/api/v1/share", usermiddleware, async (req: any, res: any) => {
    try {
        const { share, userId } = req.body; // Correctly extract the fields

        if (typeof share !== "boolean" || !userId) {
            return res.status(400).json({
                message: "Invalid request body. 'share' must be a boolean and 'userId' is required.",
            });
        }

        if (share) {
            try {
                const hash = genHashvalue(10); // Ensure genHashvalue works as expected
                const link = await LinkModel.create({
                    hash: hash,
                    userId: userId,
                });

                return res.status(200).json({
                    sharelink: hash,
                    link: `http://localhost:3000/brain/api/v1/${hash}`,
                    message: "Link created successfully",
                });
            } catch (error) {
                console.error("Error creating share link:", error); // Log error details
                return res.status(500).json({
                    message: "Error while creating the link",
                    //@ts-ignore
                    error: error.message || error,
                });
            }
        } else {
            try {
                const deletelink = await LinkModel.findOneAndDelete({ userId });
                if (!deletelink) {
                    return res.status(404).json({
                        message: "Sharelink not found",
                    });
                }
                return res.status(200).json({
                    message: "Link deleted successfully",
                });
            } catch (error) {
                console.error("Error deleting share link:", error); // Log error details
                return res.status(500).json({
                    message: "Error while deleting the link",
                    //@ts-ignore
                    error: error.message || error,
                });
            }
        }
    } catch (error) {
        console.error("Internal Server Error:", error); // Log error details
        return res.status(500).json({
            message: "Internal Server Error",
            //@ts-ignore
            error: error.message || error,
        });
    }
});


router.get("/brain/api/v1/:shareLink", async (req : any , res : any) => {
    try{
        const {shareLink} = req.params;
        const link = await LinkModel.findOne({hash : shareLink});
        if(!link){
            return res.status(403).json({
                message : "Link Not Found" });
        }
        const userId = link.userId;
        const content = await ContentModel.findOne({userId : userId}).populate("userId","username");

        if(!content){
            return res.status(403).json({
                message : "Content Not Found"
            });
        }
        return res.status(200).json({
            content : content,
            message : "Content fetched successfully"
            });
    }catch(error){
        res.status(500).json({
            message : "Internal Server Error",
            error : error
        });
    }
})


export default router;