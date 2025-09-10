import * as openpgp from "openpgp";


function uint8ArrayToBase64(u8) {
  return btoa(String.fromCharCode(...u8));
}
async function generateAESKey() {
  const key = new Uint8Array(32); 
  window.crypto.getRandomValues(key);
  return key;
}


export async function generatePGPKeys(username, email, password) {
  if (!username || !email || !password) {
    throw new Error("username, email and password are required to generate keys");
  }
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "rsa",
    rsaBits: 2048,
    userIDs: [{ name: username, email }],
    passphrase: password,
  });
  return { privateKey, publicKey };
}


export async function encryptMessage(message, senderPublicKeyArmored, recipientPublicKeyArmored) {
  if (!message && message !== "") throw new Error("message must be provided");
  if (!recipientPublicKeyArmored || !senderPublicKeyArmored) throw new Error("both sender and recipient public keys required");

  const recipientKey = await openpgp.readKey({ armoredKey: recipientPublicKeyArmored });
  const senderKey = await openpgp.readKey({ armoredKey: senderPublicKeyArmored });

  const aesKey = await generateAESKey();
  const aesKeyB64 = uint8ArrayToBase64(aesKey);


  const messageBytes = new TextEncoder().encode(message);
  const ciphertext = await openpgp.encrypt({
    message: await openpgp.createMessage({ binary: messageBytes }),
    passwords: [aesKeyB64],
  });

  const encryptedAESKeyForRecipient = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: aesKeyB64 }),
    encryptionKeys: recipientKey,
  });
  const encryptedAESKeyForSender = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: aesKeyB64 }),
    encryptionKeys: senderKey,
  });

  return { ciphertext, encryptedAESKeyForRecipient, encryptedAESKeyForSender };
}

export async function decryptPrivateKey(encryptedPrivateKeyArmored, passphrase) {
  if (!encryptedPrivateKeyArmored || !passphrase) throw new Error("Private key and passphrase required");
  const privateKey = await openpgp.readPrivateKey({ armoredKey: encryptedPrivateKeyArmored });
  const decryptedKey = await openpgp.decryptKey({ privateKey, passphrase });
  return decryptedKey;
}


export async function decryptMessage(ciphertextArmored, encryptedAESKeyArmored, privateKeyDecrypted) {
  if (!ciphertextArmored || !encryptedAESKeyArmored) 
    throw new Error("ciphertext and encryptedAESKey required");
  if (!privateKeyDecrypted) 
    throw new Error("decrypted private key object required");

  const { data: aesKeyB64 } = await openpgp.decrypt({
    message: await openpgp.readMessage({ armoredMessage: encryptedAESKeyArmored }),
    decryptionKeys: privateKeyDecrypted,
  });

  const { data: plaintext } = await openpgp.decrypt({
    message: await openpgp.readMessage({ armoredMessage: ciphertextArmored }),
    passwords: [aesKeyB64],
    format: "utf8",
  });

  return plaintext;
}
