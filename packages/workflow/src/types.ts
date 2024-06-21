import { DirectedGraph } from "graphology";

export type Loader = (event: unknown) => Promise<Instance>

export type DAG = DirectedGraph<Node, Edge>;

export interface Node {
  kind: "$action" | "$source",
  id: string;
  action?: InstanceAction;
}

export interface Edge {
  edge: InstanceEdge;
}


export interface ActionHandlerArgs {
  event: any;
  step: any;
  instance: Instance
  action: InstanceAction;
  // TODO: Action from workflow?
}

export type RunArgs = {
  event: any;
  step: any;
  instance?: Instance
}

export interface EngineOptions {
  actions?: Array<EngineAction>;

  /*
   * Specifies whether if expressions and loops are enabled within workflows.
   */
  statements?: {
    ifs?: boolean;
    loops?: boolean;
  };

  loader?: Loader;
};


/**
 * ActionHandler runs logic for a given EngineAction
 *
 */
export type ActionHandler = ({ event, step, action, instance }: ActionHandlerArgs) => Promise<any>;

/**
 * EngineAction represents a reusable action, or step, within a workflow.  It defines the
 * kind, the handler to run, the types for the action, and optionally custom UI for managing
 * the action's configuration within the workflow editor.
 *
 */
export interface EngineAction {
  kind: string;
  handler: ActionHandler;

  // TODO: Types
  inputs?: Record<string, any>
  outputs?: Record<string, any>

  // TODO: UI
};

export interface InstanceAction {
  /**
   * The ID of the action within the workflow instance.  This is used as a reference and must
   * be unique within the Instance itself.
   *
   */
  id: string;

  /**
   * The action kind, used to look up the EngineAction definition.
   *
   */
  kind: string;

  name?: string;
  description?: string;

  // TODO: Types.
  inputs?: Record<string, any>;
}

export interface InstanceEdge {
  from: string;
  to: string;

  if?: string;
  else?: string;
}


/**
 * Instance represents a defined workflow configuration, with a chain or DAG of actions
 * configured for execution.
 *
 */
export interface Instance {
  // TODO
  actions: Array<InstanceAction>
  edges: Array<InstanceEdge>
};
