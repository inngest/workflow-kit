import { ActionInput, PublicEngineAction, WorkflowAction } from "../../types";

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