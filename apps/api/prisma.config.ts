import { defineConfig } from "prisma/config";

/** DATABASE_URL must be set in the environment (Docker compose / shell). No dotenv import — keeps `prisma migrate` working after `npm prune` in prod images. */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "",
  },
});
