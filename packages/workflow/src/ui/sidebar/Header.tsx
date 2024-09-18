import { useProvider } from "../Provider";

export const SidebarHeader = () => {
  const { selectedNode, setSelectedNode, deleteAction } = useProvider();

  return (
    <div className="wf-sidebar-header">
      <div>
      {selectedNode?.type === "action" && (
        <button
          className="wf-cursor-pointer wf-sidebar-back"
          onClick={() => setSelectedNode(undefined)}
        >
          <BackArrow />
        </button>
      )}
      </div>
      <div>
        {selectedNode?.type === "action" && (
          <button
            className="wf-cursor-pointer wf-sidebar-delete"
            onClick={() => {
              // TODO: Implement delete action functionality
              console.log("Delete action clicked", selectedNode?.data?.action);
              deleteAction(selectedNode?.data?.action?.id);
            }}
            style={{
            }}
          >
            Delete action
          </button>
        )}
      </div>
    </div>
  )
}


const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10H5M5 10L8 7M5 10L8 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)