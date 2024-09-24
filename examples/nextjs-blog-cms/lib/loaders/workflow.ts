import { Workflow } from "@inngest/workflow-kit";

import { createClient } from "../supabase/server";

export async function loadWorkflow(event: { name: string }) {
  const supabase = createClient();
  const { data } = await supabase
    .from("workflows")
    .select("*", {})
    .eq("trigger", event.name)
    .eq("enabled", true)
    .single();
  return (data && data.workflow) as unknown as Workflow;
}
