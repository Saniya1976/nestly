"use client";
import { useState } from 'react'
import { toast } from 'sonner';

async function FollowButton({userId}: {userId: string}) {
    const [loading, setLoading] = useState(false);

    const handleFollow=async()=>{
        setLoading(true);
        try {
           await toggleFollow(userId);
           toast.success("Followed successfully");
        } catch (error) {
           toast.error("Failed to follow user");
        }finally{
            setLoading(false);
        }
    }
  return (
    <div>FollowButton</div>
  )
}

export default FollowButton