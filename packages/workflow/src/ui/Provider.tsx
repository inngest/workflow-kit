import React, { useEffect, useMemo, useRef, useContext, useState } from 'react';
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

  // Used so that the `position` prop in the `Sidebar` component can set
  // state and be accessed by other components.  We need this to set the
  // correct classnames on the editor and parent container.
  sidebarPosition: "right" | "left";
  setSidebarPosition: (p: "right" | "left") => void;

  selectedNode: Node | undefined;
  setSelectedNode: (n: Node | undefined) => void;

  // TODO: Selected action
  // TODO: Drag n drop
}

export const ProviderContext = React.createContext<ProviderContextType | undefined>(undefined);


export const useOnChange = (): (w: Workflow) => void => {
  const ctx = useContext(ProviderContext);
  return ctx?.onChange ?? (() => { });
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


/**
 * Hook for accessing the position of the sidebar.  Only for internal
 * use.
 * 
 * @returns the position of the sidebar.
 */
export const useSidebarPosition = (): "right" | "left" => {
  const ctx = useContext(ProviderContext);
  return ctx?.sidebarPosition ?? "right";
}

export const useProvider = (): ProviderContextType => {
  const ctx = useContext(ProviderContext);
  if (!ctx) {
    throw new Error("useProvider must be used within a Provider");
  }
  return ctx;
}

export const Provider = ({ children, workflow, trigger, onChange, availableActions }: ProviderProps & { children: React.ReactNode }) => {
  const [sidebarPosition, setSidebarPosition] = useState<"right" | "left">("right");
  const [selectedNode, setSelectedNode] = useState<Node | undefined>(undefined);

  return (
    <ProviderContext.Provider value={{
      workflow,
      trigger,
      onChange,
      availableActions,
      sidebarPosition,
      setSidebarPosition,
      selectedNode,
      setSelectedNode,
    }}>
      {children}
    </ProviderContext.Provider>
  );
}