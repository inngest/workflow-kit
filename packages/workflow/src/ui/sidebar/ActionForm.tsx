import {
  ActionInput,
  PublicEngineAction,
  Workflow,
  WorkflowAction,
} from "../../types";
import { useProvider } from "../Provider";
import { useState, useCallback, useMemo } from "react";
import { Node } from "@xyflow/react";

export type InputFormField<TValue> = ({
  value,
  onValueChange,
  onBlur,
  title,
  description,
  ...props
}: {
  value: TValue;
  onValueChange: (value: TValue) => void;
  onBlur: () => void;
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

  const action = useMemo(() => {
    return selectedNode!.data.action;
  }, [selectedNode]);

  return (
    <FormUIFieldRenderer
      key={action.id}
      id={id}
      input={input}
      formField={formField}
      action={action}
      onChange={onChange}
      workflow={workflow}
    />
  );
}

function FormUIFieldRenderer<TValue>({
  id,
  input,
  formField,
  action,
  onChange,
  workflow,
}: {
  id: string;
  input: ActionInput;
  formField?: InputFormField<TValue>;
  action: WorkflowAction;
  onChange: (workflow: Workflow) => void;
  workflow: Workflow;
}) {
  const inputs = useMemo(() => {
    return workflow.actions.find((a) => a.id === action.id)!.inputs || {};
  }, [workflow, action]);

  const [value, onValueChange] = useState<TValue>((inputs[id] ?? "") as TValue);

  const onBlur = useCallback(() => {
    const workflowCopy = {
      ...workflow,
    };

    workflowCopy.actions = workflow.actions.map((a) =>
      a.id !== action.id
        ? a
        : {
            ...a,
            inputs: {
              ...a.inputs,
              [id]: value,
            },
          },
    );

    onChange(workflowCopy);
  }, [value, id, action.id, workflow, onChange]);

  const { title, description, ...props } = input.type;

  return formField
    ? formField({
        value,
        onValueChange,
        onBlur,
        title,
        description,
        ...props,
      })
    : null;
}
