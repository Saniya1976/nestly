import { getPosts, toggleLike } from '@/actions/post.action';
import { useUser } from '@clerk/nextjs'
import { useState } from 'react';


type Posts=Awaited<ReturnType<typeof getPosts>>;
type Post=Posts[number];
function PostCard({ post, dbUserId }:{post:Post, dbUserId:string | null}) {
  const {user}=useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === dbUserId));
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes || 0);

  const handleLike = async () => {
    if (isLiking) return; // Prevent multiple clicks
    setIsLiking(true);
    try {
      if (!user) return;
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id)
    } catch (error) {
      setOptimisticLikes(post._count.likes);
      setHasLiked(false);
    } finally {
      setIsLiking(false);
    }
  };
  const handleComment = async () => {
    try {
      if (!user) return;
      setIsCommenting(true);
    } catch (error) {
    } finally {
      setIsCommenting(false);
    }
  };
  const handleDelete = async () => {
    try {
      if (!user) return;
      setIsDeleting(true);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div>
     
    </div>
  )
}

export default PostCard