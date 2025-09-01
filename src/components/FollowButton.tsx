"use client";
import { toggleFollow } from '@/actions/user.action';
import { useState } from 'react'
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Loader2Icon } from 'lucide-react';

async function FollowButton({userId}: {userId: string}) {
    const [loading, setLoading] = useState(false);

    const handleFollow=async()=>{
        setLoading(true);
        try {
           await toggleFollow({userId});
           toast.success("Followed successfully");
        } catch (error) {
           toast.error("Failed to follow user");
        }finally{
            setLoading(false);
        }
    }
  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={loading}
      className="w-20"
    >
      {loading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  )
}

export default FollowButton