import {Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import "dotenv/config"

declare global{
    namespace Express{
        interface Request{
            userId?: string
        }
    }
}

export const middleware = (req: Request, res: Response , next : NextFunction) => {
    try {
        const token = req.headers["authorization"] ?? ""

        if (!token) {
            res.status(403).json({
                message: "Unauthorized! No token provided."
            })
            return
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET || "123123") as {userId: string}

        if(decoded && decoded.userId){
            req.userId = decoded.userId
            next()
        }
        else{
            res.status(403).json({
                message: "Unauthorized! Invalid token."
            })
        }
    } catch (error) {
        res.status(403).json({
            message: "Unauthorized! Invalid or expired token."
        })
    }
}
