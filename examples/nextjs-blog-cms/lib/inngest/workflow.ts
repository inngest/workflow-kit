/* eslint-disable @typescript-eslint/no-explicit-any */

import { Engine, Workflow } from "@inngest/workflow";
import { inngest } from "./client";
import { createClient } from "../supabase/server";
import { actions } from "./workflowActions";

const workflowEngine = new Engine({
  actions,
  loader: async function (event) {
    const supabase = createClient();
    const { data } = await supabase
      .from("workflows")
      .select("*", {})
      .eq("trigger", (event as any).name)
      .eq("enabled", true)
      .limit(1);
    return data && (data[0].workflow as any satisfies Workflow);
  },
});

// Triggers
// - When a blog post is set to "review"
// - When a blog post is published

export default inngest.createFunction(
  { id: "blog-post-workflow" },
  [{ event: "blog-post.updated" }, { event: "blog-post.published" }],
  async ({ event, step }) => {
    // When `run` is called, the loader function is called with access to the event
    await workflowEngine.run({ event, step });
  }
);
