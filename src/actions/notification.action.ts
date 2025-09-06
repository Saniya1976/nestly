import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function getNotifications() {
   try {
     const userId = await getDbUserId();
     if(!userId) return [];
     
     const notification = await prisma.notification.findMany({
      where: { userId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Debug: Check for notifications with missing creators
    console.log('Total notifications:', notification.length);
    console.log('Notifications with missing creators:', 
      notification.filter(n => !n.creator).length
    );
    
    // Filter out notifications with missing creators
    return notification.filter(n => n.creator !== null);
    
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