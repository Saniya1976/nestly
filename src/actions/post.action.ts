"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

// Create Post
export async function createPost({ content, image }: { content: string; image: string }) {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const post = await prisma.post.create({
      data: {
        content,
        image: image || null, // Handle empty string
        authorId: userId,
      },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.log("Error creating post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create post",
    };
  }
}

// Get Posts
export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return { success: true, posts };
  } catch (error) {
    console.log("Error fetching posts:", error);
    throw new Error( "Failed to fetch posts" );
  }
}
