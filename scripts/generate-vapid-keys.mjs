import { generateKeyPairSync, randomBytes } from "node:crypto";

const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const privateJwk = privateKey.export({ format: "jwk" });
const publicJwk = publicKey.export({ format: "jwk" });
const publicKeyBytes = Buffer.concat([
  Buffer.from([4]),
  Buffer.from(publicJwk.x, "base64url"),
  Buffer.from(publicJwk.y, "base64url"),
]);

console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKeyBytes.toString("base64url")}`);
console.log(`VAPID_KEYS_JSON=${JSON.stringify({ publicKey: publicJwk, privateKey: privateJwk })}`);
console.log(`PUSH_WEBHOOK_SECRET=${randomBytes(32).toString("hex")}`);
