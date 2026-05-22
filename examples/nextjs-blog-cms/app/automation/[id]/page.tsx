import { AutomationEditor } from "@/components/automation-editor";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const runtime = "edge";

export default async function Automation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: workflow } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", id!)
    .single();
  if (workflow) {
    return <AutomationEditor workflow={workflow} />;
  } else {
    notFound();
  }
}
