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
    if (!currentUser) return;

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

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;
    const formattedDate = format(new Date(user.createdAt), "dd MMMM yyyy");

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
      {!currentUser ? (
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
        posts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
      ) : (
        <div className="text-center py-8 text-muted-foreground">No posts yet</div>
      )}
    </div>
  </TabsContent>

  <TabsContent value="likes" className="mt-6">
    <div className="space-y-6">
      {likedPosts.length > 0 ? (
        likedPosts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
      ) : (
        <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
      )}
    </div>
  </TabsContent>
</Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogOverlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <DialogContent className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
              <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
            
            <Separator />
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your name"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="min-h-[100px] rounded-lg"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Where are you based?"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="Your personal website"
                  className="rounded-lg"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-lg">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit} className="rounded-lg">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ProfilePageClient;