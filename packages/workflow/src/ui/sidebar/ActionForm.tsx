import { Dispatch, SetStateAction } from "react";
import { ActionInput, PublicEngineAction, WorkflowAction } from "../../types";
import { useProvider } from "../Provider";

export type InputFormField<TValue> = (props: {
  defaultValue: TValue;
  onChange: Dispatch<SetStateAction<TValue>>;
  title?: string;
  description?: string;
  required?: boolean;
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
        <span className="wf-sidebar-configure">Configure</span>
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
  const { selectedNode } = useProvider();

  selectedNode!.data.action.inputs = selectedNode!.data.action.inputs || {};

  if (formField) {
    return formField({
      defaultValue: selectedNode!.data.action.inputs[id] as TValue,
      onChange: (value: SetStateAction<TValue>) => {
        selectedNode!.data.action.inputs[id] =
          typeof value === "function"
            ? (value as (prev: TValue) => TValue)(
                selectedNode!.data.action.inputs[id] as TValue,
              )
            : value;
      },
      title: input.type.title,
      description: input.type.description,
    });
  }

  if (input.fieldType === "textarea") {
    return (
      <textarea
        defaultValue={selectedNode!.data.action.inputs[id]}
        onChange={(e) => {
          selectedNode!.data.action.inputs[id] = e.target.value;
        }}
      />
    );
  }

  return (
    <input
      type="text"
      defaultValue={selectedNode!.data.action.inputs[id]}
      onChange={(e) => {
        selectedNode!.data.action.inputs[id] = e.target.value;
      }}
    />
  );
}
