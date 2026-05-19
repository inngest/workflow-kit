import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: blogPosts, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, subtitle, markdown_ai_revision, created_at, status, markdown, ai_publishing_recommendations"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ blogPosts });
}
