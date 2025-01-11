import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { useDrizzle } from "~/server/utils/drizzle"; 

export const auth = betterAuth({
    appName: "Zirco",
    database: drizzleAdapter(useDrizzle(), {
        provider: "sqlite", // or "mysql", "sqlite"
    }),
    emailAndPassword: {
        enabled: true,
    }
})
