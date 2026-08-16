'use client';

import { 
  getFollowers,
  getFollowing,
  getProfile, 
  getProfilePosts, 
  getUserLikedPosts, 
  isFollowing, 
  updateProfile
} from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import FollowListDialog, { FollowListUser } from "@/components/FollowListDialog";
import ImageUpload from "@/components/ImageUpload";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { format } from "date-fns";
import { CalendarIcon, CameraIcon, EditIcon, FileTextIcon, HeartIcon, LinkIcon, Loader2, MapPinIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
  currentUserId?: string;
}

async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file");
  }

  if (file.size > 4 * 1024 * 1024) {
    throw new Error("File size must be less than 4MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error("Upload failed - no URL returned");
  }

  return data.secure_url as string;
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
  currentUserId
}: ProfilePageClientProps) {
  const { user: clerkUser } = useUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileImage, setProfileImage] = useState(user.image || "/avatar.png");
  const [followListType, setFollowListType] = useState<"followers" | "following" | null>(null);
  const [followList, setFollowList] = useState<FollowListUser[]>([]);
  const [isLoadingFollowList, setIsLoadingFollowList] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    image: user.image || "",
  });

  const isOwnProfile = currentUserId === user.id;
  const formattedDate = format(new Date(user.createdAt), "dd MMMM yyyy");

  const handleEditSubmit = async () => {
    try {
      setIsSavingProfile(true);
      const formData = new FormData();

      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const result = await updateProfile({ formData });
      if (result.success) {
        setProfileImage(editForm.image || "/avatar.png");
        setShowEditDialog(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !isOwnProfile) return;

    try {
      setIsUploadingAvatar(true);
      const imageUrl = await uploadImageToCloudinary(file);
      const formData = new FormData();
      formData.append("image", imageUrl);

      const result = await updateProfile({ formData });
      if (result.success) {
        setProfileImage(imageUrl);
        setEditForm((prev) => ({ ...prev, image: imageUrl }));
        toast.success("Profile picture updated");
      } else {
        toast.error("Failed to update profile picture");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFollow = async () => {
    if (!clerkUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow({ userId: user.id });
      setIsFollowing(!isFollowing);
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const openFollowList = async (type: "followers" | "following") => {
    setFollowListType(type);
    setIsLoadingFollowList(true);
    try {
      const users = type === "followers"
        ? await getFollowers(user.id)
        : await getFollowing(user.id);
      setFollowList(users);
    } catch {
      toast.error("Failed to load users");
      setFollowList([]);
    } finally {
      setIsLoadingFollowList(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post deleted successfully");
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
                <div className="relative">
                  <Avatar className="w-20 h-20 rounded-full shadow">
                    <AvatarImage src={profileImage} />
                  </Avatar>
                  {isOwnProfile && (
                    <>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground p-1.5 shadow hover:bg-primary/90 disabled:opacity-70"
                        aria-label="Change profile picture"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <CameraIcon className="size-3.5" />
                        )}
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </>
                  )}
                </div>

                <h1 className="text-lg font-semibold">{user.name ?? user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>

                {user.bio && <p className="text-xs mt-1 text-muted-foreground max-w-xs">{user.bio}</p>}

                <div className="w-full mt-4">
                  <div className="flex justify-around text-center">
                    <button
                      type="button"
                      onClick={() => openFollowList("following")}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <div className="text-sm font-semibold">{user._count.following.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => openFollowList("followers")}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <div className="text-sm font-semibold">{user._count.followers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </button>
                    <div>
                      <div className="text-sm font-semibold">{user._count.posts.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

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
                    dbUserId={currentUserId}
                    currentUserId={currentUserId}
                    onDelete={handleDeletePost}
                    showDelete={isOwnProfile}
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
                    dbUserId={currentUserId}
                    currentUserId={currentUserId}
                    showDelete={false}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile picture</label>
                <ImageUpload
                  inputId="profile-image-upload"
                  value={editForm.image}
                  onChange={(url) => setEditForm((prev) => ({ ...prev, image: url }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={editForm.website}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSavingProfile}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <FollowListDialog
          open={followListType !== null}
          onOpenChange={(open) => {
            if (!open) {
              setFollowListType(null);
              setFollowList([]);
            }
          }}
          title={followListType === "following" ? "Following" : "Followers"}
          users={followList}
          isLoading={isLoadingFollowList}
        />
      </div>
    </div>
  );
}

export default ProfilePageClient;
