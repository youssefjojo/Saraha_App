import crypto from "node:crypto";
const IV_length = +process.env.IV_LENGTH;
const Key = Buffer.from(process.env.ENCRYPTION_KEY);

export const encrypt = (data) => {
    const IV = crypto.randomBytes(IV_length);
    const cipher = crypto.createCipheriv("aes-256-cbc", Key, IV);
    let encryptedData = cipher.update(data, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData + ":" + IV.toString("hex");
}

export const decrypt = (encryptedData) => {
    const [data, ivHEX] = encryptedData.split(":");
    const IV = Buffer.from(ivHEX, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Key, IV);
    let decryptedData = decipher.update(data, "hex", "utf-8");
    decryptedData += decipher.final("utf-8");
    return decryptedData;
}

