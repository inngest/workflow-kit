"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useReducer, useState } from "react";
import { Editor, Provider, Sidebar } from "@inngest/workflow/ui";

import { useRouter } from "next/navigation";

import { SaveIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { actions } from "@/lib/inngest/workflowActions";
import { Workflow, createClient } from "@/lib/supabase/client";

import "@inngest/workflow/ui/ui.css";
import "@xyflow/react/dist/style.css";

export const AutomationEditor = ({ workflow }: { workflow: Workflow }) => {
  const router = useRouter();
  const [workflowDraft, updateWorkflowDraft] =
    useState<typeof workflow>(workflow);

  const onSaveWorkflow = useCallback(async () => {
    const supabase = createClient();
    if (workflowDraft.id.toString().startsWith("draft-")) {
      supabase
        .from("workflows")
        .insert({ workflow: workflowDraft.workflow })
        .select()
        .then(({ data }) => {
          if (data) {
            // @ts-expect-error bad typings
            updateWorkflowDraft({ id: data.id, ...workflowDraft });
          }
        });
    } else {
      await supabase
        .from("workflows")
        .update({
          workflow: workflowDraft.workflow,
        })
        .eq("id", workflowDraft.id);
    }

    router.push("/automation");
  }, [router, workflowDraft]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Automation Editor</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{workflow.name}</CardTitle>
          <CardDescription>{workflow.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {workflowDraft ? (
            <>
              <div className="h-svh max-h-[500px]">
                <Provider
                  key={workflowDraft?.id}
                  workflow={workflowDraft?.workflow as any}
                  trigger={{
                    event: {
                      name: workflowDraft.trigger,
                    },
                  }}
                  availableActions={actions}
                  onChange={(updated) => {
                    updateWorkflowDraft({
                      ...workflowDraft,
                      workflow: updated as any,
                    });
                  }}
                >
                  <Editor>
                    <Sidebar position="right"></Sidebar>
                  </Editor>
                </Provider>
              </div>
              <CardFooter className="flex justify-end align-bottom gap-4">
                <Button onClick={onSaveWorkflow}>
                  <SaveIcon className="mr-2 h-4 w-4" /> Save changes
                </Button>
              </CardFooter>
            </>
          ) : (
            <div>
              {"Use the control at the top to select or create an automation."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
