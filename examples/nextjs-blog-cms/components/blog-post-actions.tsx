"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { approveBlogPostAiSuggestions, publishBlogPost } from "@/app/actions";

export const BlogPostActions = ({ id }: { id: string }) => {
  const router = useRouter();

  const approve = useCallback(async () => {
    await approveBlogPostAiSuggestions(id);
    router.push("/");
  }, [id, router]);

  const discardAndPublish = useCallback(async () => {
    await publishBlogPost(id);
    router.push("/");
  }, [id, router]);

  return (
    <>
      <Button variant={"secondary"} onClick={discardAndPublish}>
        <SaveIcon className="mr-2 h-4 w-4" /> Discard suggestions & Publish
      </Button>
      <Button onClick={approve}>
        <SaveIcon className="mr-2 h-4 w-4" /> Approve suggestions & Publish
      </Button>
    </>
  );
};
