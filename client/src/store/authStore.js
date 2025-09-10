import { create } from 'zustand';
import {axoiosInstance} from '../lib/axios.js'
import { toast } from 'react-hot-toast';
import { io } from "socket.io-client";
import { generatePGPKeys, decryptPrivateKey } from "../lib/pgp.js";

const BASE_URL = "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    privateKey: null, 
    encryptedPrivateKey: localStorage.getItem("encryptedPrivateKey") || null,
    passphrase: localStorage.getItem("pgpPassphrase") || null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],

    signup: async (formData) => {
        set({ isSigningUp: true });
        try {
            let passphrase = localStorage.getItem("pgpPassphrase");
            if (!passphrase) {
                passphrase = crypto.randomUUID();
                localStorage.setItem("pgpPassphrase", passphrase);
            }

            const { privateKey: encryptedPrivateKey, publicKey } = await generatePGPKeys(
                formData.fullname,
                formData.email,
                passphrase
            );

            localStorage.setItem("encryptedPrivateKey", encryptedPrivateKey);

            const payload = { ...formData, publicKey };
            const res = await axoiosInstance.post("/auth/signup", payload);

            set({ authUser: res.data, encryptedPrivateKey, passphrase });
            toast.success("Signup successful");
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (formData) => {
        set({ isLoggingIn: true });
        try {
            const { email, password } = formData;

            const res = await axoiosInstance.post("/auth/login", { email, password });

            const encryptedPrivateKey = localStorage.getItem("encryptedPrivateKey");
            const passphrase = localStorage.getItem("pgpPassphrase");

            if (!encryptedPrivateKey || !passphrase) {
                throw new Error("Missing private key or passphrase in local storage");
            }
            const decryptedKey = await decryptPrivateKey(encryptedPrivateKey, passphrase);

            set({
                authUser: { ...res.data },
                privateKey: decryptedKey, 
                encryptedPrivateKey,
                passphrase
            });

            toast.success("Login successful");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axoiosInstance.post("/auth/logout");
            set({ authUser: null, privateKey: null });
            get().disconnectSocket();
            toast.success("Logout successful");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },

    checkAuth: async () => {
        try {
            const res = await axoiosInstance.get("/auth/check-auth");
            set({ authUser: res.data, isCheckingAuth: false });

            const encryptedPrivateKey = localStorage.getItem("encryptedPrivateKey");
            const passphrase = localStorage.getItem("pgpPassphrase");

            if (encryptedPrivateKey && passphrase) {
                const decryptedKey = await decryptPrivateKey(encryptedPrivateKey, passphrase);
                set({ privateKey: decryptedKey, encryptedPrivateKey, passphrase });
            }

            get().connectSocket();
        } catch (error) {
            set({ authUser: null, isCheckingAuth: false, privateKey: null });
        }
    },

    updateProfilePic: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axoiosInstance.put("/auth/update-profilePic", data);
            set({ authUser: res.data });
            toast.success("Profile picture updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query: { userId: authUser._id }
        });
        socket.connect();
        set({ socket });

        socket.on("onlineUsers", (OnUsers) => {
            set({ onlineUsers: OnUsers });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
            set({ socket: null });
        }
    }
}));
