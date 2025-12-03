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
      console.log("📱 Mobile: Starting generation...");
      const result = await generateCaptionFromText(aiPrompt);
      console.log("📱 Mobile: Got result:", result);
      
      if (result.success && result.caption) {
        setContent(result.caption);
        setShowAIPrompt(false);
        setAiPrompt("");
        toast.success("Caption generated! ✨");
      } else {
        console.error("📱 Mobile: Error:", result.error);
        toast.error(result.error || "Failed to generate caption");
      }
    } catch (error: any) {
      console.error("📱 Mobile: Catch error:", error);
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
    <Card className="mb-4 sm:mb-6">
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {/* HEADER WITH AVATAR AND TEXTAREA */}
          <div className="flex space-x-2 sm:space-x-4">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <div className="flex-1 min-w-0">
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[80px] sm:min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-sm sm:text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting || isGenerating}
              />
            </div>
          </div>

          {/* AI PROMPT SECTION */}
          {showAIPrompt && (
            <div className="border rounded-lg p-3 sm:p-4 bg-white dark:bg-zinc-900 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="size-4 sm:size-5 text-black dark:text-white" />
                  <span className="font-medium text-xs sm:text-sm text-black dark:text-white">AI Caption Generator</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAIPrompt(false);
                    setAiPrompt("");
                  }}
                  disabled={isGenerating}
                  className="text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 h-8 w-8 p-0"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
              
              <Input
                placeholder="What do you want to post about?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating}
                className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-black dark:text-white placeholder:text-black/60 dark:placeholder:text-white/60 text-sm sm:text-base h-9 sm:h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (aiPrompt.trim() && !isGenerating) {
                      handleGenerateFromText();
                    }
                  }
                }}
              />

              <Button
                size="sm"
                onClick={handleGenerateFromText}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 h-9 sm:h-10 text-sm sm:text-base"
                type="button"
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
            <div className="border rounded-lg p-3 sm:p-4">
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

          {/* ACTION BUTTONS - MOBILE: First row with Image, Generate, Improve */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* First Row: Image, Generate, Improve (Mobile) / All actions (Desktop) */}
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              {/* Image Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1 sm:flex-none text-muted-foreground hover:text-primary h-9 px-2 sm:px-3 text-sm"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting || isGenerating}
              >
                <ImageIcon className="size-4 mr-1 sm:mr-2" />
                <span className="sm:inline">Photo</span>
              </Button>

              {/* Generate Button - Only show when AI prompt is not visible */}
              {!showAIPrompt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none text-muted-foreground hover:text-purple-500 h-9 px-2 sm:px-3 text-sm"
                  onClick={() => setShowAIPrompt(true)}
                  disabled={isPosting || isGenerating}
                >
                  <SparklesIcon className="size-4 mr-1 sm:mr-2" />
                  <span className="sm:inline">Generate</span>
                </Button>
              )}

              {/* Improve Button - Only show when there's content */}
              {content.trim() && !showAIPrompt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none text-muted-foreground hover:text-blue-500 h-9 px-2 sm:px-3 text-sm"
                  onClick={handleImproveCaption}
                  disabled={isPosting || isGenerating}
                >
                  <WandIcon className="size-4 mr-1 sm:mr-2" />
                  <span className="sm:inline">
                    {isGenerating ? "Improving..." : "Improve"}
                  </span>
                </Button>
              )}
            </div>

            {/* Second Row: Post Button (Mobile) / Spacer and Post (Desktop) */}
            <div className="w-full sm:w-auto sm:ml-auto">
              <Button
                className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base px-4"
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || isPosting || isGenerating}
              >
                {isPosting ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    <span className="sm:inline">Posting...</span>
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4 mr-2" />
                    <span className="sm:inline">Post</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePost;