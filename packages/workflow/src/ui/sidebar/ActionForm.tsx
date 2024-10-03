import { ActionInput, PublicEngineAction, WorkflowAction } from "../../types";
import { useProvider } from '../Provider';

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
      {Object.entries(inputs).map(([id, input]) => (
        <label key={id}>
          {input.type.title}

          <FormUIInputRenderer input={input} id={id} />
        </label>
      ))}
    </>
  )
}

const FormUIInputRenderer = ({ id, input }: { id: string, input: ActionInput }) => {
  const { selectedNode  } = useProvider();

  selectedNode!.data.action.inputs = selectedNode!.data.action.inputs || {};

  if (input.fieldType === "textarea") {
    return (
      <textarea
        defaultValue={selectedNode!.data.action.inputs[id]}
        onChange={(e) => {
          selectedNode!.data.action.inputs[id] = e.target.value;
        }}
      />
    )
  }

  return (
    <input
      type="text"
      defaultValue={selectedNode!.data.action.inputs[id]}
      onChange={(e) => {
        selectedNode!.data.action.inputs[id] = e.target.value;
      }}
    />
  )
}
