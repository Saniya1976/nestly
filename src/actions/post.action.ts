"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

// Accept an object parameter instead
export async function createPost({ content, image }: { content: string; image: string }) {
    try {
      const userId = await getDbUserId();
      const post = await prisma.post.create({
        data: {
            content,
            image: image || null, // Handle empty string
            authorId: userId,
        }
      });
      revalidatePath("/");
      return { success: true, post };
    } catch (error) {
        console.log("Error creating post:", error);
        // Return string error message, not Error object
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to create post" 
        };
    }
}
export async function getPosts(){
  
}