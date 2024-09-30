import { createClient } from "../supabase/server";
import { BlogPost } from "../supabase/types";

export async function loadBlogPost(id: string): Promise<BlogPost> {
  const supabase = createClient();
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, subtitle, markdown_ai_revision, created_at, status, markdown, ai_publishing_recommendations"
    )
    .eq("id", id)
    .limit(1);

  const blogPost = blogPosts && blogPosts[0];

  if (!blogPost) {
    throw new Error(`Blog post #${id} not found`);
  }

  return blogPost;
}
