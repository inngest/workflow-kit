import { useRef, useState } from "react";
import { ActionInput, PublicEngineAction, WorkflowAction } from "../../types";
import { useProvider } from "../Provider";

export type InputFormField<TValue> = ({
  nodeId,
  inputId,
  value,
  onValueChange,
  title,
  description,
  ...props
}: {
  nodeId: string;
  inputId: string;
  value: TValue;
  onValueChange: (value: TValue) => void;
  title?: string;
  description?: string;
  [key: string]: unknown;
}) => React.ReactNode;

export type InputFormFieldMap<TValue> = Record<string, InputFormField<TValue>>;

type SidebarActionFormProps<TValue> = {
  workflowAction: WorkflowAction;
  engineAction: PublicEngineAction | undefined;
  inputFormFieldMap?: InputFormFieldMap<TValue>;
};

export function SidebarActionForm<TValue>({
  workflowAction,
  engineAction,
  inputFormFieldMap,
}: SidebarActionFormProps<TValue>) {
  if (engineAction === undefined) {
    return (
      <div className="wf-sidebar-form">
        {/* TODO: Add a nicer looking error state */}
        <div className="wf-sidebar-content wf-sidebar-error">
          {`Action ${workflowAction.kind} not found in provider.`}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="wf-sidebar-action">
        <p className="wf-sidebar-action-name">{engineAction.name}</p>
        <p className="wf-sidebar-action-description">
          {engineAction.description}
        </p>
      </div>
      <div className="wf-sidebar-form">
        <div className="wf-sidebar-configure" />
        <InputFormUI<TValue>
          inputs={engineAction.inputs || {}}
          inputFormFieldMap={inputFormFieldMap}
        />
      </div>
    </>
  );
}

export function InputFormUI<TValue>({
  inputs,
  inputFormFieldMap,
}: {
  inputs: Record<string, ActionInput>;
  inputFormFieldMap?: InputFormFieldMap<TValue>;
}) {
  // TODO: Handle different input types
  // TODO: Allow variables to be inserted into the input, based off of the event
  // or previous actions.
  return (
    <>
      {Object.entries(inputs).map(([id, input], index) => (
        <FormUIInputRenderer
          key={index}
          input={input}
          id={id}
          formField={
            "type" in input.type && inputFormFieldMap
              ? inputFormFieldMap[input.type["type"]]
              : undefined
          }
        />
      ))}
    </>
  );
}

function FormUIInputRenderer<TValue>({
  id,
  input,
  formField,
}: {
  id: string;
  input: ActionInput;
  formField?: InputFormField<TValue>;
}) {
  const { selectedNode, onChange, workflow } = useProvider();

  const action = selectedNode!.data.action;
  action.inputs = action.inputs || {};

  const updateWorkflowAction = () => {
    const workflowCopy = {
      ...workflow,
    };

    workflowCopy.actions = workflow.actions.map((a) =>
      a.id !== action.id
        ? a
        : {
            ...a,
            inputs: action.inputs,
          },
    );

    onChange(workflowCopy);
  };

  if (!formField) {
    if (input.fieldType === "textarea") {
      return (
        <textarea
          defaultValue={action.inputs[id]}
          onChange={(e) => {
            action.inputs[id] = e.target.value;
          }}
          onBlur={() => updateWorkflowAction()}
        />
      );
    }

    return (
      <input
        type="text"
        defaultValue={action.inputs[id]}
        onChange={(e) => {
          action.inputs[id] = e.target.value;
        }}
        onBlur={() => updateWorkflowAction()}
      />
    );
  }

  const [value, setValue] = useState<TValue>(
    selectedNode!.data.action.inputs[id] as TValue,
  );

  const { title, description, ...props } = input.type;
  return formField({
    nodeId: selectedNode!.id,
    inputId: id,
    value,
    onValueChange: (newValue: TValue) => {
      setValue(newValue);
      selectedNode!.data.action.inputs[id] = newValue;
    },
    title,
    description,
    ...props,
  });
}
