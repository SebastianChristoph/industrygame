import CryptoJS from "crypto-js";
import { createTransform } from "redux-persist";

const SECRET_KEY = "industrygame_super_secret_2024"; // Gern noch anpassen!

export const encryptTransform = createTransform(
  // Outbound: State -> Storage (verschlüsseln)
  (inboundState, key) => {
    const stringified = JSON.stringify(inboundState);
    const encrypted = CryptoJS.AES.encrypt(stringified, SECRET_KEY).toString();
    return encrypted;
  },
  // Inbound: Storage -> State (entschlüsseln)
  (outboundState, key) => {
    try {
      const bytes = CryptoJS.AES.decrypt(outboundState, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (e) {
      // Falls Entschlüsselung fehlschlägt, gib den Originalwert zurück
      return outboundState;
    }
  }
); 