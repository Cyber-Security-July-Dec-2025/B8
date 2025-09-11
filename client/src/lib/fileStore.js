// utils/fileStore.js
export function downloadKeysFile(email, encryptedPrivateKey, passphrase) {
    const data = { email, encryptedPrivateKey, passphrase };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${email}-pgp.json`;
    link.click();
}

export async function readKeysFile(file) {
    const text = await file.text();
    return JSON.parse(text); // { email, encryptedPrivateKey, passphrase }
}
