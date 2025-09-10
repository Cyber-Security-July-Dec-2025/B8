import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";

const handleGetUsers = async (req, res) => {
  try {
    const you = req.user._id;
    const allUsers = await User.find({ _id: { $ne: you } }).select("-password");

    res
      .status(200)
      .json({ message: "Users fetched successfully", users: allUsers });
  } catch (error) {
    console.log("Error fetching users", error);
    return res.status(500).json({ message: "Error fetching users" });
  }
};


const handleGetMessages = async (req, res) => {
  try {
    const secondary = req.params.id;
    const primary = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: primary, reciever: secondary },
        { sender: secondary, reciever: primary },
      ],
    });

    res
      .status(200)
      .json({ message: "Messages fetched successfully", messages });
  } catch (error) {
    console.log("Error fetching messages", error);
    return res.status(500).json({ message: "Error fetching messages" });
  }
};

const handleSendMessage = async (req, res) => {
  try {
    const { ciphertext, encryptedAESKeyForRecipient, encryptedAESKeyForSender, image } = req.body;
    const sender = req.user._id;
    const reciever = req.params.id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      sender,
      reciever,
      ciphertext, 
      encryptedAESKeyForRecipient,
      encryptedAESKeyForSender,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getRecieverSocketId(reciever);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("New-message", newMessage);
    } else {
      console.log("Receiver socket id not found");
    }

    res
      .status(200)
      .json({ message: "Message sent successfully", message: newMessage });
  } catch (error) {
    console.log("Error sending message", error);
    return res.status(500).json({ message: "Error sending message" });
  }
};

export { handleGetUsers, handleGetMessages, handleSendMessage };
