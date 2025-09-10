import jwt from "jsonwebtoken";

export const generateToken = (user,res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "4d",
    });
    res.cookie("jwt", token, {
        maxAge: 4 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    })
}