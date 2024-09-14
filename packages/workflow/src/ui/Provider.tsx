import React, { useContext, useState } from 'react';
import { Node, } from '@xyflow/react';
import { PublicEngineAction, Workflow } from "../types";
import { BlankNodeType } from './Nodes';
import { parseWorkflow } from './layout';

export type ProviderProps = {
  // The workflow to be modified by the user.
  workflow: Workflow;

  // The trigger which will run the workflow.
  trigger: any;

  // The available actions which can be used within the workflow.
  availableActions: PublicEngineAction[];

  // onChange is called when the workflow is changed via any interactivity
  // with the workflow editor.  This may be called many times on any update.
  //
  // Note that this does not imply that you must save the workflow.  You may
  // store the workflow in an internal state and only save when the user
  // hits a save button.
  onChange: (w: Workflow) => {};
}

export type ProviderContextType = ProviderProps & {

  // Used so that the `position` prop in the `Sidebar` component can set
  // state and be accessed by other components.  We need this to set the
  // correct classnames on the editor and parent container.
  sidebarPosition: "right" | "left";
  setSidebarPosition: (p: "right" | "left") => void;

  selectedNode: Node | undefined;
  setSelectedNode: (n: Node | undefined) => void;

  // blankNodeParent represents the parent of a blank node.  The blank node
  // is used as a placeholder while users select the action to add to the workflow.
  //
  // This is set when the "Add" handle is clicked.  It's unset when any
  // other node or the background is clicked.
  blankNode?: BlankNodeType | undefined;
  setBlankNode: (n: BlankNodeType | undefined) => void;

  // appendAction appends an action to the workflow under the given parent action ID.
  // The parentID may be "$source" to represent the trigger.
  appendAction: (action: PublicEngineAction, parentID: string) => void;

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
export const useAvailableActions = (): PublicEngineAction[] => {
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

export const Provider = (props: ProviderProps & { children: React.ReactNode }) => {
  const { children, workflow, trigger, onChange, availableActions } = props;
  const [sidebarPosition, setSidebarPosition] = useState<"right" | "left">("right");
  const [selectedNode, setSelectedNode] = useState<Node | undefined>(undefined);
  const [blankNode, setBlankNode] = useState<BlankNodeType | undefined>(undefined);

  const appendAction = (action: PublicEngineAction, parentID: string) => {
    const id = ((workflow?.actions?.length ?? 0) + 1).toString();

    const workflowCopy = {
      ...workflow,
      actions: (workflow?.actions ?? []).slice(),
      edges: (workflow?.edges ?? []).slice(),
    };

    workflowCopy.actions.push({
      id,
      kind: action.kind,
    });
    workflowCopy.edges.push({
      from: parentID,
      to: id,
    });

    onChange(workflowCopy);
    setBlankNode(undefined);

    // Parse the workflow and find the new node for selection.
    const parsed = parseWorkflow({ workflow: workflowCopy, trigger });
    const newNode = parsed.nodes.find((n) => n.id === id);
    console.log(newNode, id, parsed.nodes)
    if (newNode) {
      setSelectedNode(newNode);
    }
  }

  // TODO: Add customizable React components here to the Provider

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
      blankNode,
      setBlankNode,

      appendAction,
    }}>
      {children}
    </ProviderContext.Provider>
  );
}