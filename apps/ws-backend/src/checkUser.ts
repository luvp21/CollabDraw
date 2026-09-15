import jwt from "jsonwebtoken"
import "dotenv/config"

export const  checkUser = (token: string) : string | null => {
    try {
        if (!token || !process.env.JWT_SECRET) {
            return null
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET) as {userId :string}

        if(decoded && decoded.userId){
            return decoded.userId
        }

        return null
    } catch (error) {
        return null
    }
}
