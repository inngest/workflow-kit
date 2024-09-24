import { type Workflow as InngestWorkflow } from "@inngest/workflow";
import { Database as SourceDatabase } from "./database.types";

// typing `workflows.workflow` Json field
export type Database = {
  public: {
    Tables: Omit<SourceDatabase["public"]["Tables"], "workflows"> & {
      workflows: Omit<
        SourceDatabase["public"]["Tables"]["workflows"],
        "Row"
      > & {
        Row: Omit<
          SourceDatabase["public"]["Tables"]["workflows"]["Row"],
          "workflow"
        > & {
          workflow: InngestWorkflow;
        };
      };
    };
  };
};

export type Workflow = Database["public"]["Tables"]["workflows"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
