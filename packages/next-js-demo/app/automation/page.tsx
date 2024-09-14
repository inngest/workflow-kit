import { WorkflowEditor } from "@/components/workflow-editor";

export const runtime = "edge";

export default async function Automation() {
  return <WorkflowEditor />;
}
