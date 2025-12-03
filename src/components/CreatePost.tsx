"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, SparklesIcon, WandIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import { generateCaptionFromText, improveCaption } from "@/actions/ai.action";
import ImageUpload from "./ImageUpload";
import { toast } from "sonner";
import { Input } from "./ui/input";

function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  // AI states
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
      const result = await createPost({ content, image: imageUrl });
      if (result?.success) {
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        setShowAIPrompt(false);
        setAiPrompt("");
        toast.success("Post created successfully");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleGenerateFromText = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCaptionFromText(aiPrompt);
      
      if (result.success && result.caption) {
        setContent(result.caption);
        setShowAIPrompt(false);
        setAiPrompt("");
        toast.success("Caption generated! ✨");
      } else {
        toast.error(result.error || "Failed to generate caption");
      }
    } catch (error) {
      toast.error("Failed to generate caption");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveCaption = async () => {
    if (!content.trim()) {
      toast.error("Please write some content first");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await improveCaption(content);
      if (result.success && result.caption) {
        setContent(result.caption);
        toast.success("Caption improved! ✨");
      } else {
        toast.error(result.error || "Failed to improve caption");
      }
    } catch (error) {
      toast.error("Failed to improve caption");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting || isGenerating}
              />
            </div>
          </div>

          {/* AI PROMPT SECTION */}
          {showAIPrompt && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="size-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-sm">AI Caption Generator</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAIPrompt(false);
                    setAiPrompt("");
                  }}
                  disabled={isGenerating}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
              
              <Input
                placeholder="What do you want to post about?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerateFromText();
                  }
                }}
              />

              <Button
                size="sm"
                onClick={handleGenerateFromText}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="size-4 mr-2" />
                    Generate Caption
                  </>
                )}
              </Button>
            </div>
          )}

          {/* IMAGE UPLOAD SECTION */}
          {(showImageUpload || imageUrl) && (
            <div className="border rounded-lg p-4">
              <ImageUpload
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  if (url) {
                    setShowImageUpload(true);
                  }
                }}
              />
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting || isGenerating}
              >
                <ImageIcon className="size-4 mr-2" />
                Photo
              </Button>

              {!showAIPrompt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-purple-500"
                  onClick={() => setShowAIPrompt(true)}
                  disabled={isPosting || isGenerating}
                >
                  <SparklesIcon className="size-4 mr-2" />
                  AI Generate
                </Button>
              )}

              {content.trim() && !showAIPrompt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-blue-500"
                  onClick={handleImproveCaption}
                  disabled={isPosting || isGenerating}
                >
                  <WandIcon className="size-4 mr-2" />
                  {isGenerating ? "Improving..." : "Improve"}
                </Button>
              )}
            </div>

            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting || isGenerating}
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
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