'use client';

import { 
  getProfile, 
  getProfilePosts, 
  getUserLikedPosts, 
  isFollowing 
} from "@/actions/profile.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

// infer the return types
type User = Awaited<ReturnType<typeof getProfile>>;
type Posts = Awaited<ReturnType<typeof getProfilePosts>>;
type LikedPosts = Awaited<ReturnType<typeof getUserLikedPosts>>;
type Following = Awaited<ReturnType<typeof isFollowing>>;

interface ProfilePageClientProps {
  user: User;
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
    return (
       <div>ProfilePageClient</div>
     )
 
}

export default ProfilePageClient;
