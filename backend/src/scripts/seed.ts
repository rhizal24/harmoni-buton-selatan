import bcrypt from "bcryptjs";
import { pool } from "../db";
import { VILLAGES, type Village } from "../constants/villages";

interface SeedAdmin {
  village: Village;
  username: string;
  password: string;
}

function loadSeedAdmins(): SeedAdmin[] {
  const specs: { village: Village; userKey: string; passKey: string; defaultUser: string }[] = [
    {
      village: "gayabaru",
      userKey: "ADMIN_GAYABARU_USERNAME",
      passKey: "ADMIN_GAYABARU_PASSWORD",
      defaultUser: "admin_gayabaru",
    },
    {
      village: "gerakmakmur",
      userKey: "ADMIN_GERAKMAKMUR_USERNAME",
      passKey: "ADMIN_GERAKMAKMUR_PASSWORD",
      defaultUser: "admin_gerakmakmur",
    },
  ];

  return specs.map((spec) => {
    const password = process.env[spec.passKey];
    if (!password) {
      throw new Error(`Missing ${spec.passKey} in environment (needed to seed the admin).`);
    }
    return {
      village: spec.village,
      username: process.env[spec.userKey] ?? spec.defaultUser,
      password,
    };
  });
}

async function main(): Promise<void> {
  // Sanity check: keep in sync with the villages the app knows about.
  if (VILLAGES.length !== 2) {
    throw new Error(`Expected 2 villages, found ${VILLAGES.length}`);
  }

  const admins = loadSeedAdmins();

  for (const admin of admins) {
    const hash = await bcrypt.hash(admin.password, 10);
    await pool.query(
      `INSERT INTO admins (username, password_hash, village)
       VALUES ($1, $2, $3)
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash, village = EXCLUDED.village`,
      [admin.username, hash, admin.village],
    );
    console.log(`Seeded admin "${admin.username}" for village "${admin.village}".`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
