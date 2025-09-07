import { getProfile, getProfilePosts, getUserLikedPosts, isFollowing } from "@/actions/profile.action";
import ProfilePageClient from "./ProfilePageClient";
import { notFound } from "next/navigation";

export async function getUserPosts({ params }: { params: { username: string } }) {
  const user = await getProfile(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function Profilepage({ params }: { params: { username: string } }) {
  const user = await getProfile(params.username);
  if (!user) notFound();

  // fetch everything in parallel
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
      params={params}
    />
  );
}

export default Profilepage;
