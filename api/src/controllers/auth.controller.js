import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

async function handlesignup(req, res) {
    const { email, fullname, password,publicKey} = req.body;

    try {
        if(!email || !fullname || !password || !publicKey) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const userExists = await User.findOne({ email });

        if(userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            fullname,
            password: hashedPassword,
            publicKey
        });

        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();

            return res.status(201).json({ message: "User created successfully" ,
             id: newUser._id,
             email: newUser.email,
             fullname: newUser.fullname,
             profilePic: newUser.profilePic 
            });

        }else{
            return res.status(400).json({ message: "Invalid User Data" });
        }

        
    } catch (error) {
        console.log("Error creating user");
        return res.status(500).json({ message: "Error creating user" });
    }
}


async function handlelogin(req, res) {
    const { email, password } = req.body;

    try {
        if(!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);
        return res.status(200).json({ message: "User logged in successfully" ,
            _id: user._id,
            email: user.email,
            fullname: user.fullname,
            profilePic: user.profilePic
        });
    }
    catch(error){
        console.log("Error logging in user");
        return res.status(500).json({ message: "Error logging in user" });
    }
}


async function handlelogout(req, res) {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        
        return res.status(200).json({ message: "User logged out successfully" });
    }
    catch(error){
        console.log("Error logging out user");
        return res.status(500).json({ message: "Error logging out user" });
    }
}

async function handleupdateProfilePic(req, res) {

    try {
        const {profilePic} = req.body;
        const userId  = req.user._id;
    
        if(!profilePic){
            return res.status(400).json({ message: "Profile picture is required" });
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);  
        console.log("Profile picture is uploading");
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});
        res.status(200).json({ message: "Profile picture updated successfully" });

    } catch (error) {
        
        console.log("Error updating profile picture ", error);
        return res.status(500).json({ message: "Error updating profile picture" , error });

    }
}

async function checkAuth(req, res) {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error checking authentication" , error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { handlelogin, handlesignup, handlelogout, checkAuth  , handleupdateProfilePic};