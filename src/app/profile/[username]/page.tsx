import { getProfile, getProfilePosts, getUserLikedPosts, isFollowing } from "@/actions/profile.action";
import ProfilePageClient from "./ProfilePageClient";
import { notFound } from "next/navigation";

// Proper dynamic metadata export for Next.js App Router
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getProfile(username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

// Dynamic route page -- params typed as Promise, destructured inside
export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getProfile(username);
  if (!user) notFound();

  // Fetch all data in parallel
  const [posts, likedPosts, following] = await Promise.all([
    getProfilePosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={following}
      params={{ username }}
    />
  );
}
