import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, subtitle, markdown_ai_revision, created_at, status, markdown, ai_publishing_recommendations"
    )
    .order("created_at", { ascending: false });

  return NextResponse.json({ blogPosts });
}
