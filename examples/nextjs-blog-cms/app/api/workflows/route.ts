import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: workflows } = await supabase
    .from("workflows")
    .select("*")
    .order("id");

  return NextResponse.json({ workflows });
}
