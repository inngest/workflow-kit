/* eslint-disable @typescript-eslint/no-unused-vars */
import OpenAI from "openai";

import { type EngineAction } from "@inngest/workflow";
import { createClient } from "../supabase/client";

const supabase = createClient();

async function loadBlogPost(id: string) {
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .limit(1);

  return blogPosts && blogPosts[0];
}

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

export const actions: EngineAction[] = [
  {
    kind: "add_ToC",
    name: "Add a Table of Content",
    description: "Add a Table of Content",
    handler: async ({ event, step, workflowAction }) => {
      const blogPost = await step.run("Load blog post", async () =>
        loadBlogPost(event.data.id)
      );

      const content =
        workflowAction.id === "1"
          ? blogPost.markdown
          : blogPost.ai_suggestions || blogPost.markdown;

      const aiRevision = await step.run("add-toc-to-article", async () => {
        const openai = new OpenAI({
          apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
        });

        const prompt = `
        Please update the below markdown article by adding a Table of Content under the h1 title. Return only the complete updated article in markdown without the wrapping "\`\`\`".
        
        Here is the text wrapped with "\`\`\`":
        \`\`\`
        ${content}
        \`\`\`
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4", // or "gpt-3.5-turbo"
          messages: [
            {
              role: "system",
              content: "You are an AI that make text editing changes.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        return response.choices[0]?.message?.content || "";
      });

      await step.run("save-ai-revision", async () => {
        await supabase
          .from("blog_posts")
          .update({
            markdown_ai_revision: aiRevision,
            status: "review",
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    kind: "grammar_review",
    name: "Perform a grammar review",
    description: "Perform a grammar review",
    handler: async ({ event, step, workflowAction }) => {
      const blogPost = await step.run("Load blog post", async () =>
        loadBlogPost(event.data.id)
      );

      const content =
        workflowAction.id === "1"
          ? blogPost.markdown
          : blogPost.ai_suggestions || blogPost.markdown;

      const aiRevision = await step.run("get-ai-grammar-fixes", async () => {
        const openai = new OpenAI({
          apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
        });

        const prompt = `
         You are my "Hemmingway editor" AI. Please update the below article with some grammar fixes. Return only the complete updated article in markdown without the wrapping "\`\`\`".
        
        Here is the text wrapped with "\`\`\`":
        \`\`\`
        ${content}
        \`\`\`
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4", // or "gpt-3.5-turbo"
          messages: [
            {
              role: "system",
              content: "You are an AI that make text editing changes.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        return response.choices[0]?.message?.content || "";
      });

      await step.run("save-ai-revision", async () => {
        await supabase
          .from("blog_posts")
          .update({
            markdown_ai_revision: aiRevision,
            status: "review",
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    kind: "wait_for_approval",
    name: "Apply changes after approval",
    description: "Apply changes after approval",
    handler: async ({ event, step }) => {
      const approval = await step.waitForEvent(
        "wait-for-ai-suggestion-approval",
        {
          event: "blog-post.approve-ai-suggestions",
          timeout: "3d",
          match: "data.id",
        }
      );
      if (!approval) {
        await step.run("discard-ai-revision", async () => {
          await supabase
            .from("blog_posts")
            .update({
              markdown_ai_revision: null,
              status: "draft",
            })
            .eq("id", event.data.id)
            .select("*");
        });
      } else {
        const blogPost = await step.run("Load blog post", async () =>
          loadBlogPost(event.data.id)
        );

        await step.run("apply-ai-revision", async () => {
          await supabase
            .from("blog_posts")
            .update({
              markdown: blogPost.markdown_ai_revision,
              markdown_ai_revision: null,
              status: "published",
            })
            .eq("id", event.data.id)
            .select("*");
        });
      }
    },
  },
  {
    kind: "apply_changes",
    name: "Apply changes",
    description: "Apply changes",
    handler: async ({ event, step, workflowAction }) => {
      const blogPost = await step.run("Load blog post", async () =>
        loadBlogPost(event.data.id)
      );

      await step.run("apply-ai-revision", async () => {
        await supabase
          .from("blog_posts")
          .update({
            markdown: blogPost.markdown_ai_revision,
            markdown_ai_revision: null,
            status: "published",
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    kind: "send_to_mailing_list",
    name: "Send the article to the mailing list",
    description: "Send the article to the mailing list",
    handler: async ({ event, step, workflowAction }) => {
      //
    },
  },
  {
    kind: "generate_tweet_and_linked_in_posts",
    name: "Generate Twitter and LinkedIn posts",
    description: "Generate Twitter and LinkedIn posts",
    handler: async ({ event, step, workflowAction }) => {
      //
    },
  },
];
