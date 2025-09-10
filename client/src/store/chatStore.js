
import { create } from "zustand";
import toast from "react-hot-toast";
import { axoiosInstance } from "../lib/axios.js";   
import { useAuthStore } from "./authStore.js";
import { encryptMessage, decryptMessage, decryptPrivateKey } from "../lib/pgp.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axoiosInstance.get("/messages/users");
      set({ users: res.data.users });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const encryptedPrivateKey = localStorage.getItem("encryptedPrivateKey");
      const passphrase = localStorage.getItem("pgpPassphrase");
      const currentUser = useAuthStore.getState().authUser;   

      if (!encryptedPrivateKey || !passphrase) throw new Error("Missing key/passphrase");

      const privateKeyDecrypted = await decryptPrivateKey(encryptedPrivateKey, passphrase);

      const res = await axoiosInstance.get(`/messages/${userId}`);

      const decryptedMessages = await Promise.all(
        res.data.messages.map(async (msg) => {
          try {
            const encryptedAESKeyArmored =
              String(msg.sender) === String(currentUser._id)
                ? msg.encryptedAESKeyForSender
                : msg.encryptedAESKeyForRecipient;

            const text = await decryptMessage(
              msg.ciphertext,
              encryptedAESKeyArmored,
              privateKeyDecrypted
            );

            return { ...msg, text };
          } catch (err) {
            console.error("Message decryption failed", err);
            return { ...msg, text: "[Decryption failed]" };
          }
        })
      );

      set({ messages: decryptedMessages });
    } catch (error) {
      toast.error(error.message || "Failed to load messages");
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessage: async (text) => {
    const { selectedUser, messages } = get();
    const currentUser = useAuthStore.getState().authUser; 

    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const { ciphertext, encryptedAESKeyForRecipient, encryptedAESKeyForSender } =
        await encryptMessage(text, currentUser.publicKey, selectedUser.publicKey);

      const res = await axoiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { ciphertext, encryptedAESKeyForRecipient, encryptedAESKeyForSender }
      );

      set({
        messages: [...messages, { ...res.data.message, text }],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  suscribeToMessages: () => {
    const { socket } = useAuthStore.getState();
    const currentUser = useAuthStore.getState().authUser;
    if (!socket) return;

    socket.off("New-message");
    socket.on("New-message", async (message) => {
      const { selectedUser, messages } = get();
      if (!selectedUser) return;

      if (String(message.sender) !== String(selectedUser._id)) return;

      try {
        const encryptedPrivateKey = localStorage.getItem("encryptedPrivateKey");
        const passphrase = localStorage.getItem("pgpPassphrase");
        if (!encryptedPrivateKey || !passphrase) return;

        const privateKeyDecrypted = await decryptPrivateKey(encryptedPrivateKey, passphrase);

        const encryptedAESKeyArmored =
          String(message.sender) === String(currentUser._id)
            ? message.encryptedAESKeyForSender
            : message.encryptedAESKeyForRecipient;

        const text = await decryptMessage(
          message.ciphertext,
          encryptedAESKeyArmored,
          privateKeyDecrypted
        );

        set({ messages: [...messages, { ...message, text }] });
      } catch (err) {
        console.error("Socket message decryption failed", err);
      }
    });
  },

  unsuscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;
    socket.off("New-message");
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
}));
