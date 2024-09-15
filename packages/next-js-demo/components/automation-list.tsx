"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EditIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Workflow, createClient } from "@/lib/supabase/client";

export const AutomationList = () => {
  const supabase = createClient();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const refreshWorkflows = useCallback(async () => {
    const { data } = await supabase.from("workflows").select("*");

    setWorkflows(data || []);
  }, []);

  useEffect(() => {
    refreshWorkflows();
  }, []);

  const onToggleWorkflow = (workflowId: number) => async (enabled: boolean) => {
    await supabase
      .from("workflows")
      .update({
        enabled,
      })
      .eq("id", workflowId)
      .select("*");

    await refreshWorkflows();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Automations</h2>
      </div>
      <div className="grid gap-6">
        {(workflows || []).map((workflow) => {
          const actions: any[] = (workflow.workflow as any)?.actions || [];
          return (
            <Card key={workflow.id}>
              <CardHeader>
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  {actions.length
                    ? actions.map(({ name, kind }) => name || kind).join(", ")
                    : "No actions"}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="airplane-mode"
                    checked={workflow.enabled!}
                    onCheckedChange={onToggleWorkflow(workflow.id)}
                  />
                  <Label htmlFor="airplane-mode">Active</Label>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/automation/${workflow.id}`}>
                    <EditIcon className="mr-2 h-4 w-4" /> Configure
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
