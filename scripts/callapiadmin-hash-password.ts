import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run callapiadmin:hash -- <password>");
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  const b64 = Buffer.from(hash).toString("base64");

  console.log("\nLocal .env:\n");
  console.log(`CALLAPIADMIN_PASSWORD_HASH=${hash}\n`);

  console.log("Vercel (recommended — avoids $ corruption):\n");
  console.log(`CALLAPIADMIN_PASSWORD_HASH_B64=${b64}\n`);
});
