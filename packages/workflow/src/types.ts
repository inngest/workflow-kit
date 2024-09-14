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

// TODO: Define event type more clearly.
export type TriggerEvent = Record<string, any>;

/**
 * PublicEngineAction is the type representing an action in the *frontend UI*.  This is
 * a subset of the entire EngineAction type.
 * 
 * Actions for workflows are defined in the backend, directly on the Engine.  The Engine
 * provides an API which lists public information around the available actions - this type. 
 */
export interface PublicEngineAction {
  /**
   * Kind is an enum representing the action's ID.  This is not named as "id"
   * so that we can keep consistency with the WorkflowAction type.
   */
  kind: string;

  /**
   * Name is the human-readable name of the action.
   */
  name: string;

  /**
   * Description is a short description of the action.
   */
  description?: string;

  /**
   * Icon is the name of the icon to use for the action.  This may be an HTTP
   * URL, or an SVG directly.
   */
  icon?: string;

  /**
   * Inputs define input variables which can be configured by the workflow UI. 
   */
  inputs?: Record<string, ActionInput>

  /**
   * Outputs define the responses from the action, including the type, name, and
   * an optional description
   */
  outputs?: TSchema | Record<string, ActionOutput>;

  edges?: {
    /**
     * allowAdd controls whether the user can add new edges to the graph
     * via the "add" handle.
     * 
     * If undefined this defaults to true (as most nodes should allow adding
     * subsequent actions).
     */
    allowAdd?: boolean;

    /**
     * Edges allows the definition of predefined edges from this action,
     * eg. "True" and "False" edges for an if statement, or "Not received"
     * edges if an action contains `step.waitForEvent`.
     */
    edges?: Array<Omit<WorkflowEdge, "from" | "to">>;
  }
};

/**
 * EngineAction represents a reusable action, or step, within a workflow.  It defines the
 * kind, the handler to run, the types for the action, and optionally custom UI for managing
 * the action's configuration within the workflow editor.
 * 
 * Note that this is the type representing an action in the *backend engine*.
 *
 */
export interface EngineAction extends PublicEngineAction {
  /**
   * The handler is the function which runs the action.  This may comprise of
   * many individual inngest steps. 
   */
  handler: ActionHandler;
};

/**
 * ActionHandler runs logic for a given EngineAction
 */
export type ActionHandler = (args: ActionHandlerArgs) => Promise<any>;

export interface ActionInput {
  /**
   * Type is the TypeBox type for the input.  This is used for type checking, validation,
   * and form creation.
   * 
   * Note that this can include any of the JSON-schema refinements within the TypeBox type.
   * 
   * @example
   * ```
   * type: Type.String({
   *   title: "Email address",
   *   description: "The email address to send the email to",
   *   format: "email",
   * })
   * ```
   */
  type: TSchema,

  /**
   * fieldType allows customization of the text input component, for string types.
   */
  fieldType?: "textarea" | "text"
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
  name?: string;
  description?: string;
  metadata?: Record<string, any>;

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

  /**
   * The name of the edge to show in the UI
   */
  name?: string,

  /**
   * Conditional is a ref (eg. "!ref($.action.ifcheck.result)") which must be met
   * for the edge to be followed.
   * 
   * The `conditional` field is automatically set when using the built-in if
   * action.
   * 
   */
  conditional?: {
    /**
     * type indicates whether this is the truthy if, the else block, or a
     * "select" case block which must match a given value.
     * 
     * for "if", the value will be inteprolated via "!!" to a boolean.
     * for "else", the value is will be evaluated via "!" to a boolean.
     * for "match", the value is will be evaluated via "===" to a boolean.
     */
    type: "if" | "else" | "match",
    /**
     * The ref to evaluate.  This can use the shorthand: `!ref($.result)` to
     * refer to the result of the previous action.
     */
    ref: string; // Ref input, eg. "!ref($.action.ifcheck.result)"
    /**
     * Value to match against, if type is "match"
     */
    value?: string;
  },
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
  /**
   * Event is the event which triggered the workflow.
   */
  event: TriggerEvent;
  /**
   * Step are the step functions from Inngest's SDK, allowing each
   * action to be executed as a durable step function.  This exposes
   * all step APIs: `step.run`, `step.waitForEvent`, `step.sleep`, etc.
   * 
   */
  step: any;

  /**
   * Workflow is the workflow definition.
   */
  workflow: Workflow

  /**
   * WorkflowAction is the action being executed, with fully interpolate
   * inputs.
   */
  workflowAction: WorkflowAction;

  /**
   * State represnets the current state of the workflow, with previous
   * action's outputs recorded as key-value pairs.
   */
  state: Map<string, any>;
}

export type RunArgs = {
  event: any;
  step: any;
  workflow?: Workflow
}
