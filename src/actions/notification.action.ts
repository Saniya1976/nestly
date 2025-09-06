"use client"

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function getNotifications() {
   try {
     const userId=await getDbUserId();
     if(!userId)return [];
     const notification=await prisma.notification.findMany({
        where:{
            userId,
        },
        include:{
            creator:{
                select:{
                    id:true,
                    name:true,
                    username:true,
                    image:true,
                }
            }
        },
        orderBy:{
            createdAt:"desc"
        }
     })
     return notification;
   } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
   }
}
export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false };
  }
}