'use client';

import { 
  getProfile, 
  getProfilePosts, 
  getUserLikedPosts, 
  isFollowing, 
  updateProfile
} from "@/actions/profile.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

// infer the return types
type User = Awaited<ReturnType<typeof getProfile>>;
type Posts = Awaited<ReturnType<typeof getProfilePosts>>;
type LikedPosts = Awaited<ReturnType<typeof getUserLikedPosts>>;
type Following = Awaited<ReturnType<typeof isFollowing>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: LikedPosts;
  isFollowing: Following;
  params: { username: string };
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
  params
}: ProfilePageClientProps) {
 const {user:currentUser}=useUser();
 const [showEditDialog, setShowEditDialog] = useState(false);
 const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
 
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });
const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

  const result=await updateProfile({formData});
    if(result.success){
      setShowEditDialog(false);
      toast.success("Profile updated successfully!");
    }
  }

    return (
       <div>ProfilePageClient</div>
     )
 
}

export default ProfilePageClient;
