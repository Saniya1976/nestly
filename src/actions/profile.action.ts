"use server"


import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
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