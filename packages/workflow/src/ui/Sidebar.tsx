import { useProvider } from "./Provider";

export type SidebarProps = {
  /**
   * The position of the sidebar.  Defaults to "right".
   */
  position?: "right" | "left";

  children: React.ReactNode;
}

export const Sidebar = (props: SidebarProps) => {
  const { setSidebarPosition, trigger } = useProvider();

  // Set this within context so the parent editor can adjust our
  // flex layouts correctly.
  setSidebarPosition(props.position === "left" ? "left" : "right");

  let content = props.children || useSidebarContent();

  return (
    <div className="wf-sidebar">
      {content}
    </div>
  )
}

export const SidebarFooter = () => {
  return (
    <div className="wf-sidebar-footer">
      {/* TODO: Add stuff */}
    </div>
  )
}


const useSidebarContent = () => {
  const { trigger, selectedNode } = useProvider();

  console.log(selectedNode);

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

  return (
    <div>
      {selectedNode?.type}
    </div>
  )
}

export const SidebarWorkflowForm = () => {
  const { workflow, onChangeWorkflow } = useProvider();

  return (
    <div className="wf-sidebar-form">
      <label>
        Workflow name
        <input
          type="text"
          defaultValue={workflow?.name}
          placeholder="Untitled workflow"
          onBlur={(e) => {
            onChangeWorkflow({ ...workflow, name: e.target.value });
          }}
        />
      </label>
      <label>
        Description
        <textarea
          placeholder="Add a short description..."
          defaultValue={workflow?.description}
          rows={4}
        />
      </label>
    </div>
  )
} 