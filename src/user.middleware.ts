import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_password } from "./config";

export const usermiddleware: any = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: any = req.headers["authorization"];

        if (!token) {
            return res.status(403).send({
                message: "Authorization Token Not Passed",
            });
        }

        const verifytoken = await jwt.verify(token, JWT_password);

        if (verifytoken) {
            //@ts-ignore
            req.username = verifytoken.username;
            //@ts-ignore
            req.body.userId = verifytoken.id;
            return next();
        } else {
            return res.status(403).send({
                message: "You are not Signed In",
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: "Internal Error UM",
            error: error,
        });
    }
};
