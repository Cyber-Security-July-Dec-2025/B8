# Chatter 📨🔐

**Chatter** is a secure real-time messaging app that uses **OpenPGP** and a hybrid encryption model (AES + OpenPGP) to provide **end-to-end encryption**. All messages are encrypted on the sender's device; the server stores only ciphertext and encrypted keys. The project uses a single `Message` model (no separate Conversation model) and stores an AES-encrypted payload plus two encrypted AES keys (one for the recipient and one for the sender) so both parties can decrypt the stored ciphertext independently.

---

## Table of Contents

- [Intro](#intro)
- [Repo structure](#repo-structure)
- [Features](#features)
- [Data model](#data-model)
- [How encryption works)](#how-encryption-works)
- [Installation & running](#installation--running)
- [API Endpoints](#api-endpoints)
- [Security & best practices](#security--best-practices)

---

## Intro

Chatter aims to combine the usability of modern chat apps with strong privacy guarantees. Message payloads are encrypted symmetrically (AES) for performance; the AES session key is encrypted with OpenPGP (asymmetric) so only intended recipients — and the sender for local history — can recover it.

**Key Benefits:**
- **End-to-end encryption**: Messages are encrypted before leaving your device
- **Zero-knowledge server**: Server never sees plaintext messages or keys
- **Real-time messaging**: WebSocket-based instant communication

---

## Repo structure

```
/ (repo root)
├── .gitattributes
├── .gitignore
├── README.md
├── api/
│   ├── package-lock.json
│   ├── package.json
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── message.controller.js
│       ├── database/
│       │   └── connect.js
│       ├── index.js
│       ├── lib/
│       │   ├── cloudinary.js
│       │   ├── socket.js
│       │   └── utils.js
│       ├── middleware/
│       │   └── auth.middleware.js
│       ├── models/
│       │   ├── message.model.js
│       │   └── user.model.js
│       └── routes/
│           ├── authRoutes.js
│           └── messageRoutes.js
└── client/
    ├── .env
    ├── .gitignore
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── public/
    │   ├── avatar.png
    │   └── vite.svg
    ├── src/
    │   ├── App.css
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── AuthImagePattern.jsx
    │   │   ├── ChatBox.jsx
    │   │   ├── ChatHeader.jsx
    │   │   ├── MessageInput.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── constants/
    │   │   │   └── index.js
    │   │   ├── pages/
    │   │   │   ├── HomePage.jsx
    │   │   │   ├── Login.jsx
    │   │   │   ├── NoChat.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── SettingsPage.jsx
    │   │   │   └── Signup.jsx
    │   │   └── skeletons/
    │   │       ├── MessageSkeleton.jsx
    │   │       └── SidebarSkeleton.jsx
    │   ├── index.css
    │   ├── lib/
    │   │   ├── axios.js
    │   │   ├── pgp.js
    │   │   └── utils.jsx
    │   ├── main.jsx
    │   └── store/
    │       ├── authStore.js
    │       ├── chatStore.js
    │       └── themeStore.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Features

### 🔒 Security Features
- **End-to-end encryption** using OpenPGP + AES hybrid model
- **Zero-knowledge architecture** - server never sees plaintext
- **Perfect forward secrecy** with unique AES keys per message
- **Secure key storage** with encrypted private keys in localStorage
- **Authentication** with bcrypt password hashing

### 💬 Messaging Features
- **Real-time messaging** via WebSocket connections
- **Message history** with client-side decryption
- **Online status** indicators
- **Message delivery confirmation**

### 🎨 User Experience
- **Modern UI** with Tailwind CSS styling
- **Dark/Light theme** support
- **Responsive design** for mobile and desktop
- **User profiles** with avatar support
- **Settings management**
- **Loading skeletons** for better UX

### 🛠 Technical Features
- **React.js** frontend with Vite
- **Node.js/Express** backend
- **MongoDB** database
- **Socket.io** for real-time communication
- **Cloudinary** for image storage
- **Zustand** for state management

---

## Data model

### Message Model

**Path:** `api/src/models/message.model.js`

Important fields:
- `sender` (ObjectId → User) - Reference to message sender
- `receiver` (ObjectId → User) - Reference to message recipient  
- `ciphertext` — AES-encrypted message content
- `encryptedAESKeyForRecipient` — AES key encrypted with recipient's public key
- `encryptedAESKeyForSender` — AES key encrypted with sender's public key
- `image` — optional (URL or encrypted blob metadata)


**Rationale:** Storing both `encryptedAESKeyForRecipient` and `encryptedAESKeyForSender` allows both parties to decrypt the same ciphertext independently without exposing keys to the server.

### User Model

**Path:** `api/src/models/user.model.js`

Important fields:
- `email` — unique user identifier
- `fullname` — display name
- `password` — bcrypt hashed password
- `publicKey` — OpenPGP public key for encryption
- `timestamp` — account creation date

---

## How encryption works 

The hybrid encryption model combines the performance of symmetric encryption (AES) with the security of asymmetric encryption (OpenPGP).

### 1. Key Generation
- Client generates an **OpenPGP key pair** (public/private) using the Web Crypto API
- **Public key** is uploaded to the server and associated with the user account
- **Private key** is encrypted with a user passphrase and stored in localStorage
- Private key never leaves the client device

### 2. Sending a Message
```
1. Generate random AES-256 session key
2. Encrypt message content with AES-GCM → ciphertext
3. Encrypt AES key with recipient's public key → encryptedAESKeyForRecipient
4. Encrypt AES key with sender's public key → encryptedAESKeyForSender
5. Send encrypted message object to server
```

**Message Object:**
```json
{
  "sender": "userId1",
  "receiver": "userId2", 
  "ciphertext": "base64_encrypted_content",
  "encryptedAESKeyForRecipient": "base64_encrypted_key",
  "encryptedAESKeyForSender": "base64_encrypted_key",
  "image": "optional_encrypted_image_url"
}
```

### 3. Reading a Message
- **Recipient**: Decrypts `encryptedAESKeyForRecipient` with their private key → recovers AES key → decrypts `ciphertext`
- **Sender**: Decrypts `encryptedAESKeyForSender` with their private key → decrypts `ciphertext` for message history

### 4. Security Properties
- **Confidentiality**: Only sender and recipient can read messages
- **Integrity**: AES-GCM provides authentication
- **Forward Secrecy**: Each message uses a unique AES key

---

## Installation & Running

### Prerequisites
- **Node.js** (v20 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager

### Backend Setup

1. **Clone the repository**
```bash
git clone `https://github.com/shubh5921/chatter`
cd chatter/api
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment variables**
Create a `.env` file in the `api` directory:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/chatter
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. **Start the backend server**
```bash
npm run dev
```
The API will be available at `http://localhost:5001`

### Frontend Setup

1. **Navigate to client directory**
```bash
cd ../client
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment variables**
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5001/api

```

4. **Start the development server**
```bash
npm run dev
```
The client will be available at `http://localhost:5173`

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| PUT | `/update-profilePic` | Update user profile | Yes |
| GET | `/check-auth` | Verify auth status | Yes |

### Message Routes (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users except current | Yes |
| GET | `/:id` | Get messages with specific user | Yes |
| POST | `/send/:id` | Send encrypted message | Yes |

---


## Security & Best Practices

### 🔐 Cryptographic Security

- **AES-256-GCM** for symmetric encryption (authenticated encryption)
- **RSA-4096** or **ECC P-384** for OpenPGP key pairs
- **bcrypt** with salt rounds ≥12 for password hashing
- **Cryptographically secure random** number generation



## Acknowledgments

- **OpenPGP.js** for client-side encryption
- **Socket.io** for real-time communication
- **React.js** and **Vite** for modern frontend development
- **Express.js** and **MongoDB** for backend infrastructure
- **Tailwind CSS** for beautiful, responsive design
