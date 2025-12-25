import jwt from "jsonwebtoken"
import "dotenv/config"

export const  checkUser = (token: string) : string | null => {
    try {
        if (!token) {
            return null
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET! || "123123") as {userId :string}

        if(decoded && decoded.userId){
            return decoded.userId
        }

        return null
    } catch (error) {
        return null
    }
}
