import { DirectedGraph } from "graphology";
import { TSchema } from '@sinclair/typebox'

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
export type ActionHandler = (args: ActionHandlerArgs) => Promise<any>;

/**
 * EngineAction represents a reusable action, or step, within a workflow.  It defines the
 * kind, the handler to run, the types for the action, and optionally custom UI for managing
 * the action's configuration within the workflow editor.
 *
 */
export interface EngineAction {
  kind: string;
  handler: ActionHandler;

  /**
   * Inputs define input variables which can be configured by the workflow UI. 
   *
   */
  inputs?: Record<string, ActionInput>

  /**
   * Outputs define the responses from the action, including the type, name, and
   * an optional description
   */
  outputs?: TSchema | Record<string, ActionOutput>,
};

export interface ActionInput {
  type: TSchema,
  description?: string;

  // TODO: UI components for each input.
}

export interface ActionOutput {
  type: TSchema,
  description?: string;
}

/**
 * Workflow represents a defined workflow configuration, with a chain or DAG of actions
 * configured for execution.
 *
 */
export interface Workflow {
  actions: Array<WorkflowAction>
  edges: Array<WorkflowEdge>
};


/**
 * WorkflowAction is the representation of an action within a workflow instance.
 */
export interface WorkflowAction {
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

  /**
   * Inputs is a list of configured inputs for the EngineAction.
   *
   * The record key is the key of the EngineAction inoput name, and
   * the value is the variable's value.
   *
   * This will be type checked to match the EngineAction type before
   * save and before execution.
   * 
   * Ref inputs for interpolation are "!ref($.<path>)",
   * eg. "!ref($.event.data.email)"
   */
  inputs?: Record<string, any>;
}

export interface WorkflowEdge {
  from: string;
  to: string;

  if?: string;
  else?: string;
}


/**
 * Loader represents a function which takes an Inngest event, then returns
 * a workflow Instance.
 *
 * For example, you may write a function which looks up a user's workflow,
 * stored as JSON, in a DB, unmarshalled into an Instance.
 *
 * If an Instance is not found, this should throw an error.
 */
export type Loader = (event: unknown) => Promise<Workflow>

export type DAG = DirectedGraph<Node, Edge>;

export interface Node {
  kind: "$action" | "$source",
  id: string;
  action?: WorkflowAction;
}

export interface Edge {
  edge: WorkflowEdge;
}

export interface ActionHandlerArgs {
  event: any;
  step: any;
  workflow: Workflow
  workflowAction: WorkflowAction;
  // TODO: Action from workflow?
}

export type RunArgs = {
  event: any;
  step: any;
  workflow?: Workflow
}
