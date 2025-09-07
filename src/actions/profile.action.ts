"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import { auth } from "@clerk/nextjs/server";
export async function getProfile(username:string){
    try {
        const profile=await prisma.user.findUnique({
            where:{
               username: username
            },
            select:{
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true,
                createdAt: true,
               _count:{
                select:{
                    followers: true,
                    following: true,
                    posts: true,
                }
               }
            }
        });
        return profile;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw new Error("Failed to fetch profile");
    }
}
export async function getProfilePosts(userId:string){
    try {
        const posts=await prisma.post.findMany({
            where:{
               authorId:userId,
            },
            include:{
                author:{
                    select:{
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                comments:{
                    orderBy:{
                        createdAt:"asc"
                    },
                    include:{
                        author:{
                            select:{
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            }
                        }
                }
            },
            likes:{
                select:{
                   userId: true,
                }
            },
            _count:{
                select:{
                    comments: true,
                    likes: true,
                }
            }
          },
          orderBy: {
        createdAt: "desc",
      },
        });
        return posts;
    } catch (error) {
        console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  
    }
}
export async function getUserLikedPosts(userId:string){
    try {
        const LikedPosts=await prisma.post.findMany({
            where:{
                likes:{
                    some:{
                        userId: userId
                    },
                }
            },
            include:{
                author:{
                    select:{
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                comments:{
                    orderBy:{
                        createdAt:"asc"
                    },
                    include:{
                }
            },
            likes:{
                select:{
                   userId: true,
                }
            },
            _count:{
                select:{
                    comments: true,
                    likes: true,
                }
            }
          },
          orderBy: {
        createdAt: "desc",

            }
        });
        return LikedPosts;
    } catch (error) {
         console.error("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
    }
}
export async function updateProfile({formData }: {formData: FormData }) {
try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name,
        bio,
        location,
        website,
      },
    });

    revalidatePath("/profile");
    return {success:true, user};
} catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
}
}
export async function isFollowing(userId:string){
    try {
       const currentUserId = await getDbUserId();
       if (!currentUserId) return false; 
       const follow=await prisma.follows.findUnique({
        where:{
            followerId_followingId:{
                followerId: currentUserId,
                followingId: userId,
            }
        }
       })
       return !!follow;
    } catch (error) {
          console.error("Error checking follow status:", error);
          return false;
    }
}