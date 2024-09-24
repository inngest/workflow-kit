import { createClient } from "../supabase/server";

export async function loadBlogPost(id: string) {
  const supabase = createClient();
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, subtitle, markdown_ai_revision, created_at, status, markdown, ai_publishing_recommendations"
    )
    .eq("id", id)
    .limit(1);

  return blogPosts && blogPosts[0];
}
