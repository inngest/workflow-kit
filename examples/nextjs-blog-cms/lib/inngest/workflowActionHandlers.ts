/* eslint-disable @typescript-eslint/no-unused-vars */
import OpenAI from "openai";
import { type WorkflowAction, type EngineAction } from "@inngest/workflow";

import { type BlogPost } from "../supabase/types";

import { createClient } from "../supabase/server";
import { loadBlogPost } from "../loaders/blog-post";
import { actions } from "./workflowActions";

// helper to ensure that each step of the workflow use
//  the original content or current AI revision
function blogPostContentOrAiRevision(
  workflowAction: WorkflowAction,
  blogPost: BlogPost
) {
  return workflowAction.id === "1" // the first action of the workflow gets assigned id: "1"
    ? blogPost.markdown // if we are the first action, we use the initial content
    : blogPost.markdown_ai_revision || blogPost.markdown; // otherwise we use the previous current ai revision
}

export const actionsWithHandlers: EngineAction[] = [
  {
    // Add a Table of Contents
    ...actions[0],
    handler: async ({ event, step, workflowAction }) => {
      const supabase = createClient();

      const blogPost = await step.run("load-blog-post", async () =>
        loadBlogPost(event.data.id)
      );

      const aiRevision = await step.run("add-toc-to-article", async () => {
        const openai = new OpenAI({
          apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
        });

        const prompt = `
        Please update the below markdown article by adding a Table of Content under the h1 title. Return only the complete updated article in markdown without the wrapping "\`\`\`".

        Here is the text wrapped with "\`\`\`":
        \`\`\`
        ${blogPostContentOrAiRevision(workflowAction, blogPost)}
        \`\`\`
        `;

        const response = await openai.chat.completions.create({
          model: process.env["OPENAI_MODEL"] || "gpt-3.5-turbo",
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
            status: "under review",
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    // Perform a grammar review
    ...actions[1],
    handler: async ({ event, step, workflowAction }) => {
      const supabase = createClient();

      const blogPost = await step.run("load-blog-post", async () =>
        loadBlogPost(event.data.id)
      );

      const aiRevision = await step.run("get-ai-grammar-fixes", async () => {
        const openai = new OpenAI({
          apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
        });

        const prompt = `
        You are my "Hemmingway editor" AI. Please update the below article with some grammar fixes. Return only the complete updated article in markdown without the wrapping "\`\`\`".

        Here is the text wrapped with "\`\`\`":
        \`\`\`
        ${blogPostContentOrAiRevision(workflowAction, blogPost)}
        \`\`\`
        `;

        const response = await openai.chat.completions.create({
          model: process.env["OPENAI_MODEL"] || "gpt-3.5-turbo",
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
            status: "under review",
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    // Apply changes after approval
    ...actions[2],
    handler: async ({ event, step }) => {
      const supabase = createClient();

      const blogPost = await step.run("load-blog-post", async () =>
        loadBlogPost(event.data.id)
      );

      await step.run("update-blog-post-status", async () => {
        await supabase
          .from("blog_posts")
          .update({
            status: "needs approval",
          })
          .eq("id", event.data.id)
          .select("*");
      });

      // wait for the user to approve or discard the AI suggestions
      const approval = await step.waitForEvent(
        "wait-for-ai-suggestion-approval",
        {
          event: "blog-post.approve-ai-suggestions",
          timeout: "1d",
          match: "data.id",
        }
      );

      // without action from the user within 1 day, the AI suggestions are discarded
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
        await step.run("apply-ai-revision", async () => {
          await supabase
            .from("blog_posts")
            .update({
              markdown: blogPost.markdown_ai_revision,
              markdown_ai_revision: null,
              status: "published",
            })
            .eq("id", blogPost.id)
            .select("*");
        });
      }
    },
  },
  {
    // Apply changes
    ...actions[3],
    handler: async ({ event, step }) => {
      const supabase = createClient();

      const blogPost = await step.run("load-blog-post", async () =>
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
          .eq("id", blogPost.id)
          .select("*");
      });
    },
  },
  {
    // Send the article to the mailing list
    ...actions[4],
    handler: async ({ event, step, workflowAction }) => {
      //
    },
  },
  {
    // Generate Twitter and LinkedIn posts
    ...actions[5],
    handler: async ({ event, step, workflowAction }) => {
      //
    },
  },
];
