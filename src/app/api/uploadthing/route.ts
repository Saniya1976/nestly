// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes for Next.js App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    logLevel: "Error", // Reduce logging noise
    isDev: process.env.NODE_ENV === "development"
  },
});