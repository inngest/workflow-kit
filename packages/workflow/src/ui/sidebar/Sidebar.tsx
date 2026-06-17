import { useEffect } from "react";
import { useProvider } from "../Provider";
import { SidebarWorkflowForm } from "./WorfklowForm";
import { SidebarFooter } from "./Footer";
import { ActionList } from "./ActionList";
import { SidebarActionForm } from "./ActionForm";
import { SidebarHeader } from "./Header";
import { WorkflowAction } from "../../types";

export type SidebarProps = {
  /**
   * The position of the sidebar.  Defaults to "right".
   */
  position?: "right" | "left";

  children?: React.ReactNode;
}

export const Sidebar = (props: SidebarProps) => {
  const { setSidebarPosition } = useProvider();

  // Set this within context so the parent editor can adjust our
  // flex layouts correctly.
  useEffect(() => {
    setSidebarPosition(props.position === "left" ? "left" : "right");
  }, [props.position])

  let content = props.children || useSidebarContent();

  return (
    <div className="wf-sidebar">
      {content}
    </div>
  )
}

const useSidebarContent = () => {
  const { trigger, selectedNode, availableActions } = useProvider();

  if (trigger === undefined) {
    // TODO (tonyhb): Allow users to define how triggers are selected,
    // including trigger loading passed in to the Provider.
    return (
      <>
        <div className="wf-sidebar-content">
          To get started, select a trigger.
        </div>
        <SidebarFooter />
      </>
    )
  }

  if (selectedNode === undefined) {
    return (
      <>
        <SidebarWorkflowForm />
        <SidebarFooter />
      </>
    )
  }

  switch (selectedNode.type) {
    case "action": {
      const workflowAction = selectedNode.data.action as WorkflowAction;
      const engineAction = availableActions.find((action) => action.kind === workflowAction.kind);

      return (
        <>
          <SidebarHeader />
          {/* Include a key attribute so that the inputs in the action
          update as the selected node changes. */}
          <SidebarActionForm workflowAction={workflowAction} engineAction={engineAction} key={`node-${selectedNode.id}`} />
          <SidebarFooter />
        </>
      )
    }
    case "blank": {
      return (
        <ActionList actions={availableActions} />
      )
    }
  }

  return (
    <div>
      {selectedNode?.type}
    </div>
  )
}
