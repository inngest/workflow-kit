import { ActionInput, PublicEngineAction, WorkflowAction } from "../types";
import { useAvailableActions, useProvider } from "./Provider";

export type SidebarProps = {
  /**
   * The position of the sidebar.  Defaults to "right".
   */
  position?: "right" | "left";

  children: React.ReactNode;
}

export const Sidebar = (props: SidebarProps) => {
  const { setSidebarPosition } = useProvider();

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
          <SidebarActionForm workflowAction={workflowAction} engineAction={engineAction} />
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

type SidebarActionFormProps = {
  workflowAction: WorkflowAction,
  engineAction: PublicEngineAction | undefined,
}

export const SidebarActionForm = ({ workflowAction, engineAction }: SidebarActionFormProps) => {
  if (engineAction === undefined) {
    return (
      <div className="wf-sidebar-form">
        {/* TODO: Add a nicer looking error state */}
        <div className="wf-sidebar-content wf-sidebar-error">
          {`Action ${workflowAction.kind} not found in provider.`}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="wf-sidebar-action">
        <p className="wf-sidebar-action-name">{engineAction.name}</p>
        <p className="wf-sidebar-action-description">{engineAction.description}</p>
      </div>
      <div className="wf-sidebar-form">
        <span className="wf-sidebar-configure">Configure</span>
        {InputFormUI(engineAction.inputs || {})}
      </div>
    </>
  );
}

export const InputFormUI = (inputs: Record<string, ActionInput>) => {
  // TODO: Handle different input types
  // TODO: Allow variables to be inserted into the input, based off of the event
  // or previous actions.
  return (
    <>
      {Object.entries(inputs).map(([key, input]) => (
        <label key={key}>
          {input.type.title || key}
          {input.fieldType === "textarea" ? <textarea /> : <input type="text" />}
        </label>
      ))}
    </>
  )
}

export const ActionList = ({ actions }: { actions: PublicEngineAction[] }) => {
  const { workflow, onChange, blankNode, setBlankNode, appendAction } = useProvider();

  return (
    <div>
      <div className="wf-sidebar-content">
        Select an action
      </div>
      <div className="wf-sidebar-content">
        {actions.map((action) => (
          <ActionListItem key={action.kind} action={action} onClick={() => {
            if (blankNode === undefined) {
              return;
            }
            appendAction(action, blankNode?.data.parent.id, blankNode?.data.edge);
          }} />
        ))}
      </div>
    </div>
  )
}

export const ActionListItem = ({ action, onClick }: { action: PublicEngineAction, onClick: () => void }) => {
  return (
    <div className="wf-sidebar-action-list-item" onClick={onClick}>
      {action.name}
    </div>
  )
}