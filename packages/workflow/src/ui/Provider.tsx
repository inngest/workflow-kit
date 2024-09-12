import React, { useEffect, useMemo, useRef, useContext } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  useNodesInitialized,
} from '@xyflow/react';
import { EngineAction, Workflow, WorkflowAction } from "../types";
import { useLayout } from './layout';
import { TriggerNode, ActionNode } from './Nodes';


export type ProviderProps = {
  // The workflow to be modified by the user.
  workflow: Workflow;

  // The trigger which will run the workflow.
  trigger: any;

  // The available actions which can be used within the workflow.
  availableActions: EngineAction[];

  // onChange is called when the workflow is changed via any interactivity
  // with the workflow editor.  This may be called many times on any update.
  //
  // Note that this does not imply that you must save the workflow.  You may
  // store the workflow in an internal state and only save when the user
  // hits a save button.
  onChange: (w: Workflow) => {};
}

type ProviderContextType = ProviderProps & {
  // TODO: Selected action
  // TODO: Drag n drop
}

export const ProviderContext = React.createContext<ProviderContextType | undefined>(undefined);


export const useOnChange = (): (w: Workflow) => void => {
  const ctx = useContext(ProviderContext);
  return ctx?.onChange ?? (() => {});
}

/**
 * Hook for accessing the workflow we're modifying
 * 
 */
export const useWorkflow = (): Workflow | undefined => {
  const ctx = useContext(ProviderContext);
  return ctx?.workflow;
}

/**
 * Hook for accessing the trigger which runs the workflow.
 * 
 */
export const useTrigger = (): any => {
  const ctx = useContext(ProviderContext);
  return ctx?.trigger;
}

/**
 * Hook for accessing the available actions we can use within
 * the workflow.
 * 
 */
export const useAvailableActions = (): EngineAction[] => {
  const ctx = useContext(ProviderContext);
  return ctx?.availableActions ?? [];
}


export const Provider = ({ children, workflow, trigger, onChange, availableActions }: ProviderProps & { children: React.ReactNode }) => {
  return (
    <ProviderContext.Provider value={{ workflow, trigger, onChange, availableActions }}>
      {children}
    </ProviderContext.Provider>
  );
}