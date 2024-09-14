"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { Editor, Provider, Sidebar } from "@inngest/workflow/ui";

import { PlusIcon, SaveIcon, Circle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { actions } from "@/lib/inngest/workflow";
import { createClient } from "@/lib/supabase/client";

import "@inngest/workflow/ui/ui.css";
import "@xyflow/react/dist/style.css";
import { Database } from "@/lib/supabase/database.types";

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
      });
  }, []);

  const onSelectWorkflow = useCallback(
    (workflowId: string) => {
      const w = workflows.find(({ id }) => id.toString() === workflowId);
      if (w) {
        updateWorkflowDraft(w);
      }
    },
    [workflows]
  );

  const onNewDraft = useCallback(() => {
    updateWorkflowDraft({ id: `draft-${self.crypto.randomUUID()}` });
  }, []);

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
          enabled: workflowDraft.enabled,
        })
        .eq("id", workflowDraft.id);
    }

    supabase
      .from("workflows")
      .select("*")
      .then(({ data }) => {
        setWorkflows(data || []);
      });
  }, [workflowDraft]);

  console.log("workflowDraft", workflowDraft);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Automation</h2>
        <div className="flex gap-2 justify-end items-center">
          <Select
            onValueChange={onSelectWorkflow}
            value={
              workflowDraft && !workflowDraft.id.toString().startsWith("draft-")
                ? workflowDraft.id.toString()
                : undefined
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select an automation" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select an automation</SelectLabel>
                {(workflows || []).map(({ workflow, id, enabled }) => (
                  <SelectItem key={id} value={id.toString()}>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        {(workflow as any)?.name || `Automation #${id}`}
                      </div>
                      {enabled ? (
                        <Circle
                          className={`h-4 w-4 fill-emerald-500 stroke-none`}
                        />
                      ) : (
                        <Circle
                          className={`h-4 w-4 fill-red-700 stroke-none`}
                        />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={onNewDraft}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create a new automation
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Automation Editor</CardTitle>
          <CardDescription>
            Use the Editor below to modify your automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflowDraft ? (
            <>
              <div className="h-svh max-h-[500px]">
                <Provider
                  key={workflowDraft?.id}
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
                    updateWorkflowDraft({
                      ...workflowDraft,
                      workflow: updated,
                    });
                  }}
                >
                  <Editor>
                    <Sidebar position="right"></Sidebar>
                  </Editor>
                </Provider>
              </div>
              <CardFooter className="flex justify-end align-bottom gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workflow-enabled"
                    value={workflowDraft.enabled}
                    onCheckedChange={(enabled) => {
                      updateWorkflowDraft({
                        ...workflowDraft,
                        enabled,
                      });
                    }}
                  />
                  <Label htmlFor="workflow-enabled">Enable</Label>
                </div>
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
