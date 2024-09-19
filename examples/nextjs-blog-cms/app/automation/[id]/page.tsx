import { AutomationEditor } from "@/components/automation-editor";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const runtime = "edge";

export default async function Automation({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: workflows } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", params.id!)
    .limit(1);
  if (workflows && workflows[0]) {
    return <AutomationEditor workflow={workflows![0]} />;
  } else {
    notFound();
  }
}
