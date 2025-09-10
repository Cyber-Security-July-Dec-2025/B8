import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ciphertext: {
      type: String,
      required: true,
    },
    encryptedAESKeyForRecipient: {
      type: String,
      required: true,
    },
    encryptedAESKeyForSender: {
      type: String,
      required: true,
    },
    image: {
      type: String, // optional, for storing image URL if you send attachments
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
