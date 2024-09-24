import { type PublicEngineAction } from "@inngest/workflow/types";

// Actions
//   - Review actions
//     - Add ToC to the article
//     - Add grammar suggestions
//     - Add SEO on-page optimization suggestions
//     - [Apply changes]
//     - [Apply changes after approval]
//   - Post-publish actions
//     - Get Tweet verbatim
//     - Get LinkedIn verbatim
export const actions: PublicEngineAction[] = [
  {
    kind: "add_ToC",
    name: "Add a Table of Contents",
    description: "Add an AI-generated ToC",
  },
  {
    kind: "grammar_review",
    name: "Perform a grammar review",
    description: "Use OpenAI for grammar fixes",
  },
  {
    kind: "wait_for_approval",
    name: "Apply changes after approval",
    description: "Request approval for changes",
  },
  {
    kind: "apply_changes",
    name: "Apply changes",
    description: "Save the AI revisions",
  },
  {
    kind: "generate_linkedin_posts",
    name: "Generate LinkedIn posts",
    description: "Generate LinkedIn posts",
  },
  {
    kind: "generate_tweet_posts",
    name: "Generate Twitter posts",
    description: "Generate Twitter posts",
  },
];
