"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { actions } from "@/lib/inngest/workflow";
import { Editor, Provider, Sidebar } from "@inngest/workflow/ui";

import { Type } from "@sinclair/typebox";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

import "@inngest/workflow/ui/ui.css";
import "@xyflow/react/dist/style.css";
import { Database } from "@/lib/supabase/database.types";

const availableActions = [
  {
    name: "Send an email",
    description: "Sends an email via Resend",
    kind: "send-email",
    icon: "📧",
    inputs: {
      to: {
        type: Type.String({
          title: "To",
          description: "The email address to send the email to",
        }),
      },
      subject: {
        type: Type.String({
          title: "Subject",
          description: "The subject of the email",
        }),
      },
      body: {
        type: Type.String({
          title: "Email content",
          description: "The content of the email",
        }),
        fieldType: "textarea",
      },
    },
  },
  {
    name: "Send a text message",
    description: "Sends a text message via Twilio",
    kind: "send-text-message",
    icon: "📧",
    inputs: {
      to: {
        type: Type.String({
          title: "Phone number",
          description: "The phone number to send the text message to",
        }),
      },
      body: {
        type: Type.String({
          title: "Text message",
          description: "The text message itself",
        }),
      },
    },
  },
];

export const WorkflowEditor = () => {
  const [workflowDraft, updateWorkflowDraft] = useState<any>(undefined);
  const [workflows, setWorkflows] = useState<
    Database["public"]["Tables"]["workflows"]["Row"][]
  >([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("workflows")
      .select("*")
      .then(({ data }) => {
        setWorkflows(data || []);
        updateWorkflowDraft(data ? data[0] : undefined);
      });
  });

  const onSelectWorkflow = useCallback(
    (workflowId: string) => {
      const w = workflows.find(
        // @ts-expect-error JSONB
        ({ workflow: { id } }) => id.toString() === workflowId
      );
      if (w) {
        updateWorkflowDraft(w);
      }
    },
    [workflows]
  );

  console.log("workflowDraft", workflowDraft);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Automation</h2>
        <div className="flex gap-2 justify-end items-center">
          <Select
            onValueChange={onSelectWorkflow}
            value={workflowDraft ? workflowDraft.id.toString() : undefined}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select an automation" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select an automation</SelectLabel>
                {(workflows || []).map(({ workflow, id }) => (
                  <SelectItem key={id} value={id.toString()}>
                    {(workflow as any).name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Create a new automation
          </Button>
        </div>
      </div>
      <div className="h-svh max-h-[700px]">
        <Provider
          workflow={workflowDraft?.workflow}
          trigger={{
            event: {
              name: "blog.updated",
              data: {
                status: "review",
              },
            },
          }}
          availableActions={actions}
          onChange={(updated) => {
            console.log("updated", updated);
            // updateWorkflowDraft(updated);
          }}
        >
          <Editor>
            <Sidebar position="right"></Sidebar>
          </Editor>
        </Provider>
      </div>
    </div>
  );
};
