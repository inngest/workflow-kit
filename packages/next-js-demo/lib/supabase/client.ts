import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";

export type Workflow = Database["public"]["Tables"]["workflows"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
