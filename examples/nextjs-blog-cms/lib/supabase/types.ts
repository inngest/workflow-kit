import { type Workflow as InngestWorkflow } from "@inngest/workflow-kit";

export type Workflow = {
  id: number;
  name: string;
  description: string;
  trigger: string;
  enabled: boolean;
  workflow: InngestWorkflow;
};

export type BlogPost = {
  id: string;
  title: string;
  subtitle: string;
  markdown: string;
  markdown_ai_revision: string | null;
  ai_publishing_recommendations: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type Database = any;
export type Json = any;