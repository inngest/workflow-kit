/* eslint-disable @typescript-eslint/no-unused-vars */

import { Engine, type EngineAction } from "@inngest/workflow";
import { inngest } from "./client";

// Actions:
//  - Add table of content
//  - Grammar review + grammer fixes
//  - Publish on (Substack/X/...)

export const actions: EngineAction[] = [
  {
    kind: "add_ToC",
    name: "Add a Table of Content",
    description: "Add a Table of Content",
    handler: async ({ event, step, workflowAction }) => {},
  },
  {
    kind: "grammar_review",
    name: "Perform a grammar review",
    description: "Perform a grammar review",
    handler: async ({ event, step, workflowAction }) => {},
  },
  {
    kind: "wait_for_approval",
    name: "Apply changes after approval",
    description: "Apply changes after approval",
    handler: async ({ event, step, workflowAction }) => {},
  },
  {
    kind: "apply_changes",
    name: "Apply changes",
    description: "Apply changes",
    handler: async ({ event, step, workflowAction }) => {},
  },
];

const workflowEngine = new Engine({
  actions,
  loader: async function (event) {
    // TODO: load from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {} as any;
  },
});

export default inngest.createFunction(
  { id: "blog-post-workflow" },
  { event: "blog.updated", if: 'event.data.status == "review"' },
  async ({ event, step }) => {
    // When `run` is called, the loader function is called with access to the event
    await workflowEngine.run({ event, step });
  }
);
