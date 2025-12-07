'use client';

import { 
  getProfile, 
  getProfilePosts, 
  getUserLikedPosts, 
  isFollowing, 
  updateProfile
} from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogOverlay } from "@radix-ui/react-dialog";
import { Separator } from "@radix-ui/react-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { format } from "date-fns";
import { CalendarIcon, EditIcon, FileTextIcon, HeartIcon, LinkIcon, MapPinIcon, X } from "lucide-react";
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
  currentUserId?: string; // Database user ID (not Clerk ID)
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
  params,
  currentUserId // This is the DATABASE user ID
}: ProfilePageClientProps) {
  const { user: clerkUser } = useUser();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();

    Object.entries(editForm).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string); 
      }
    });

    const result = await updateProfile({formData});
    if (result.success) {
      setShowEditDialog(false);
      toast.success("Profile updated successfully");
    }
  };

  const handleFollow = async () => {
    if (!clerkUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow({ userId: user.id });
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  // FIXED: Use only the database user ID
  const isOwnProfile = currentUserId === user.id;

  const formattedDate = format(new Date(user.createdAt), "dd MMMM yyyy");

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post deleted successfully");
        // You might want to refresh the posts here
        window.location.reload();
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error deleting post");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                {/* Avatar */}
                <Avatar className="w-16 h-16 rounded-full shadow">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>

                {/* Name + Username */}
                <h1 className="text-lg font-semibold">{user.name ?? user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>

                {/* Bio */}
                {user.bio && <p className="text-xs mt-1 text-muted-foreground max-w-xs">{user.bio}</p>}

                {/* Stats */}
                <div className="w-full mt-4">
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-sm font-semibold">{user._count.following.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{user._count.followers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{user._count.posts.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* Follow / Edit Buttons */}
                {!clerkUser ? (
                  <SignInButton mode="modal">
                    <Button size="sm" className="w-full mt-3">Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button size="sm" className="w-full mt-3" onClick={() => setShowEditDialog(true)}>
                    <EditIcon className="size-3 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}

                {/* Location + Website + Date */}
                <div className="w-full mt-4 space-y-1 text-xs text-muted-foreground">
                  {user.location && (
                    <div className="flex items-center justify-center">
                      <MapPinIcon className="size-3 mr-1" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center justify-center">
                      <LinkIcon className="size-3 mr-1" />
                      <a
                        href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <CalendarIcon className="size-3 mr-1" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full flex border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex-1 flex items-center justify-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                       data-[state=active]:bg-transparent py-4 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex-1 flex items-center justify-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                       data-[state=active]:bg-transparent py-4 font-semibold"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    dbUserId={user.id}
                    currentUserId={currentUserId} // Pass DATABASE user ID
                    onDelete={handleDeletePost}
                    showDelete={true}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    dbUserId={user.id}
                    currentUserId={currentUserId} // Pass DATABASE user ID
                    showDelete={false} // Don't show delete for liked posts
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog remains the same */}
      </div>
    </div>
  );
}

export default ProfilePageClient;