import { createAuthClient } from "better-auth/vue"
export const authClient = createAuthClient({
    baseURL: "https://zr.localhost" // the base url of your auth server
})