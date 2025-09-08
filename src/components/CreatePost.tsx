'use client';

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2, Send } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { createPost } from "@/actions/post.action";
import { Avatar, AvatarImage } from "./ui/avatar";
import ImageUpload from "./ImageUpload";



function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  const handleSubmit = async (): Promise<void> => {
    if (!content.trim() && !imageUrl) return;
    setIsPosting(true);
    try {
      const result = await createPost({ 
        content, 
        image: imageUrl 
      });
      
      if (result?.success) {
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        toast.success("Post created successfully!");
      } else {
        // Handle error case if needed
        console.error("Failed to create post:", result?.error);
        toast.error("Failed to create post");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="shadow-sm border-gray-200 mb-4 sm:mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="w-12 h-12 shrink-0">
              <AvatarImage 
                src={user?.imageUrl || "/avatar.png"} 
                className="rounded-full object-cover"
                alt="User avatar"
              />
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[100px] resize-none border-0 focus-visible:ring-0 bg-gray-50 rounded-lg p-4 text-base placeholder:text-gray-500 focus:bg-white focus:shadow-sm transition-all duration-200"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting}
              />
            </div>
          </div>

          {(showImageUpload || imageUrl) && (
  <div className="ml-16 border border-gray-200 rounded-lg p-4 bg-gray-50">
    <ImageUpload
      value={imageUrl}
      onChange={(url) => {
        console.log("Image URL changed:", url); // Debug log
        setImageUrl(url);
        if (!url) setShowImageUpload(false); // Close uploader when image is removed
      }}
      endpoint="postImage"
    />
  </div>
)}

          <div className="flex items-center justify-between ml-16 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors duration-200"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Photo
              </Button>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePost;