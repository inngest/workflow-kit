import { Workflow } from "@inngest/workflow-kit";

import { createClient } from "../supabase/service";

export async function loadWorkflow(event: { name: string }) {
  const supabase = createClient();
  const { data } = await supabase
    .from("workflows")
    .select("*", {})
    .eq("trigger", event.name)
    .eq("enabled", true)
    .single();
return (data as any)?.workflow as Workflow;
}
