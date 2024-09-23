import { type PublicEngineAction } from "@inngest/workflow/types";

// Actions
//   - Review actions
//     - Add ToC to the article
//     - Add grammar suggestions
//     - Add SEO on-page optimization suggestions
//     - [Apply changes]
//     - [Apply changes after approval]
//   - Post-publish actions
//     - Send the article to the mailing list (Resend audience)
//     - Get Tweet and LinkedIn verbatim
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
    kind: "send_to_mailing_list",
    name: "Send the article to the mailing list",
    description: "Send the article to the mailing list",
  },
  {
    kind: "generate_tweet_and_linked_in_posts",
    name: "Generate Twitter and LinkedIn posts",
    description: "Generate Twitter and LinkedIn posts",
  },
];
