import { useEffect } from "react";
import { useProvider } from "../Provider";
import { SidebarWorkflowForm } from "./WorfklowForm";
import { SidebarFooter } from "./Footer";
import { ActionList } from "./ActionList";
import { InputFormFieldMap, SidebarActionForm } from "./ActionForm";
import { SidebarHeader } from "./Header";
import { WorkflowAction } from "../../types";

export type SidebarProps<TValue> = {
  /**
   * The position of the sidebar.  Defaults to "right".
   */
  position?: "right" | "left";

  children?: React.ReactNode;
  inputFormFieldMap?: InputFormFieldMap<TValue>;
};

export function Sidebar<TValue>({
  inputFormFieldMap,
  ...props
}: SidebarProps<TValue>) {
  const { setSidebarPosition } = useProvider();

  // Set this within context so the parent editor can adjust our
  // flex layouts correctly.
  useEffect(() => {
    setSidebarPosition(props.position === "left" ? "left" : "right");
  }, [props.position]);

  let content = props.children || useSidebarContent({ inputFormFieldMap });

  return <div className="wf-sidebar">{content}</div>;
}

function useSidebarContent<TValue>({
  inputFormFieldMap,
}: {
  inputFormFieldMap?: InputFormFieldMap<TValue>;
}) {
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
    );
  }

  if (selectedNode === undefined) {
    return (
      <>
        <SidebarWorkflowForm />
        <SidebarFooter />
      </>
    );
  }

  switch (selectedNode.type) {
    case "action": {
      const workflowAction = selectedNode.data.action as WorkflowAction;
      const engineAction = availableActions.find(
        (action) => action.kind === workflowAction.kind,
      );

      return (
        <>
          <SidebarHeader />
          <SidebarActionForm
            workflowAction={workflowAction}
            engineAction={engineAction}
            inputFormFieldMap={inputFormFieldMap}
          />
          <SidebarFooter />
        </>
      );
    }
    case "blank": {
      return <ActionList actions={availableActions} />;
    }
  }

  return <div>{selectedNode?.type}</div>;
}
