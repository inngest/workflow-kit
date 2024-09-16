"use server";
import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";

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

export const listBlogPosts = async () => {
  const supabase = createClient();
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, subtitle, markdown_ai_revision, created_at, status, markdown"
    );

  return blogPosts || [];
};

export const publishBlogPost = async (id: string) => {
  const supabase = createClient();
  await supabase
    .from("blog_posts")
    .update({
      status: "published",
      markdown_ai_revision: null,
    })
    .eq("id", id);
};
