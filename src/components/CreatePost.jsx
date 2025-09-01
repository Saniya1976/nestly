'use client';

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { ImageIcon, Loader2, Send } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { createPost } from "@/actions/post.action"; // Import your actual server action

function CreatePost() {
    const user = useUser();
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    
   const handleSubmit = async () => {
    // Allow posting with just content OR just image OR both
    if (!content.trim() && !imageUrl) return;
    
    setIsPosting(true);
    try {
        // Call your actual server action (not the component)
        const result = await createPost({ content, imageUrl });
        
        if (result?.success) {
            setContent("");
            setImageUrl("");
            setShowImageUpload(false);
            toast.success("Post created successfully!");
        } else {
            // SAFELY handle error - convert Error objects to strings
            const errorMessage = result?.error instanceof Error 
                ? result.error.message 
                : result?.error || "Failed to create post";
            toast.error(errorMessage);
        }
    } catch (error) {
        // SAFELY handle caught errors - convert Error objects to strings
        const errorMessage = error instanceof Error 
            ? error.message 
            : "Failed to create post. Please try again.";
        toast.error(errorMessage);
    } finally {
        setIsPosting(false);
    }
};
    return (
        <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <Avatar className="w-12 h-12 shrink-0">
                            <AvatarImage 
                                src={user?.imageUrl || "/avatar.png"} 
                                className="rounded-full object-cover"
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
                                endpoint="postImage"
                                value={imageUrl}
                                onChange={(url) => {
                                    setImageUrl(url);
                                    if (!url) setShowImageUpload(false);
                                }}
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