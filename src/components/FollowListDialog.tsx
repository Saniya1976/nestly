"use client";

import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export type FollowListUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
};

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  users: FollowListUser[];
  isLoading: boolean;
}

function FollowListDialog({
  open,
  onOpenChange,
  title,
  users,
  isLoading,
}: FollowListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[360px]">
          {isLoading ? (
            <p className="p-4 text-sm text-center text-muted-foreground">Loading...</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-center text-muted-foreground">No users to show</p>
          ) : (
            <div className="p-2">
              {users.map((listedUser) => (
                <Link
                  key={listedUser.id}
                  href={`/profile/${listedUser.username}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="size-10">
                    <AvatarImage src={listedUser.image ?? "/avatar.png"} />
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {listedUser.name ?? listedUser.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{listedUser.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default FollowListDialog;
