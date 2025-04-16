import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create NextAuth handler
const handler = NextAuth(authOptions);

// Export the handler as named functions for HTTP methods
export const GET = handler;
export const POST = handler; 