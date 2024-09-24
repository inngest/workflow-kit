import { useProvider } from "../Provider";

/**
 * The form for editing a workflow's name and description.
 */
export const SidebarWorkflowForm = () => {
  const { workflow, onChange } = useProvider();

  return (
    <div className="wf-sidebar-form">
      <label>
        Workflow name
        <input
          type="text"
          defaultValue={workflow?.name}
          placeholder="Untitled workflow"
          onBlur={(e) => {
            onChange({ ...workflow, name: e.target.value });
          }}
        />
      </label>
      <label>
        Description
        <textarea
          placeholder="Add a short description..."
          defaultValue={workflow?.description}
          rows={4}
          onBlur={(e) => {
            onChange({ ...workflow, description: e.target.value });
          }}
        />
      </label>
    </div>
  )
} 
