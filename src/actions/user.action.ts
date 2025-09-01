"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { error } from "console";
import { toast } from "sonner";


export async function syncUser(){
    try {
        const {userId}=await auth();
        const user= await currentUser();
        if(!userId || !user) return;
        const existingUser=await prisma.user.findUnique({
            where:{
                clerkId:userId
            }
        })
        if(existingUser) return existingUser;
        const dbUser=await prisma.user.create({
            data:{
                clerkId:userId,
                 name: `${user.firstName || ""} ${user.lastName || ""}`,
                 username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                 email: user.emailAddresses[0].emailAddress,
                 image: user.imageUrl,
            }
        })
        return dbUser;
    } catch (error) {
        console.error("Error syncing user:", error);
    }
}

export async function getUserByClerkId(clerkId: string){
   return prisma.user.findUnique({
    where:{
        clerkId,
    },
    include:{
        _count:{
            select:{
                posts:true,
                followers:true,
                following:true,
            }
        }

    }
   })
}

export async function getDbUserId(){
const {userId:clerkId}=await auth();
if(!clerkId) throw new Error("User not authenticated");
const user=await getUserByClerkId(clerkId);
if(!user) throw new Error("User not found");
return user.id;
}
export async function getRandomUsers(){
    try {
      const userId=await getDbUserId();
      const randomUsers=await prisma.user.findMany({
        where:{
            AND:[
                {NOT:{id:userId},},
                {NOT:{
                    followers:{
                        some:{
                            followerId:userId
                        }
                    }
                }},
            ]
        },
        select:{
            id:true,
            username:true,
            image:true,
            name:true,
            _count:{
                select:{
                    posts:true,
                    followers:true,
                    following:true,
                }
            }
        },
        take:3,
      })
      //get 3 random users to follow without our id and the person we already follow
      return randomUsers;

    } catch (error) {
        console.log("Error fetching random users:", error);
        return [];
    }
}
export async function toggleFollow({userId}:{userId:string}){
    try {
        const targetUserId=await getDbUserId();
        if(userId===targetUserId) throw new Error("You cannot follow yourself");
       const existingFollow=await prisma.follows.findUnique({
            where:{
                followerId_followingId:{
                    followerId:userId,
                    followingId:targetUserId
                }
            }
       })
       if(existingFollow){
        await prisma.follows.delete({
            where:{
                followerId_followingId:{
                    followerId:userId,
                    followingId:targetUserId
                }
            }
        })
       }else{
        await prisma.$transaction([
            prisma.follows.create({
                data:{
                    followerId:userId,
                    followingId:targetUserId
                }
            }),
             prisma.notification.create({
                data:{
                    type:"FOLLOW",
                    userId:targetUserId,
                    creatorId:userId,
                }
             })
        ])
       }
     return {success: true};
    } catch (error) {
        toast.error("Failed to toggle follow");
    }
}