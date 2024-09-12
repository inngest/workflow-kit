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
      <button>Save</button>
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

  return (
    <div>
      {selectedNode?.type}
    </div>
  )
}