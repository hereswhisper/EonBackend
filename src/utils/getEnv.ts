import { config } from "dotenv";
import { resolve } from "path";

// Determine the environment file based on NODE_ENV
const envFileSuffix =
  process.env.NODE_ENV === "development" ? ".dev.env" : ".env";

const envFilePath = resolve(process.cwd(), envFileSuffix);

config({ path: envFilePath });

export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (value === undefined)
    throw new Error(`Environment variable ${name} has not been set.`);

  return value;
}
