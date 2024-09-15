import { inngest } from "@/lib/inngest/client";

export const sendBlogPostToReview = async (id: string) => {
  await inngest.send({
    name: "blog-post.updated",
    data: {
      id,
    },
  });
};

export const approveBlogPostAiSuggestions = async (id: string) => {
  await inngest.send({
    name: "blog-post.approve-ai-suggestions",
    data: {
      id,
    },
  });
};
