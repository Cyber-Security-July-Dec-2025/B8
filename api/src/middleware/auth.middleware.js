import Jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protectRoute = async (req, res, next) => {
    
    try {
        const token = req.cookies.jwt;

        if(!token){
            console.log("Token not found");
            return res.status(401).json({ message: "Not authorized, token not found" });
        }

        const decoded = Jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if(!user){
            console.log("User not found");
            return res.status(401).json({ message: "Not authorized, user not found" });
        }
        req.user = user;
        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Internal server error" });
    }
}