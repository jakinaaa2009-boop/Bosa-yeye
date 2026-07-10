import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run callapiadmin:hash -- <password>");
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log("\nAdd to .env:\n");
  console.log(`CALLAPIADMIN_PASSWORD_HASH=${hash}\n`);
});
