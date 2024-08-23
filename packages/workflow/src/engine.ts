import jsonpath from "jsonpath";
import {
  type RunArgs,
  type EngineOptions,
  type EngineAction,
  type WorkflowAction,
  type Loader,
  type Workflow,
  DAG,
} from "./types";
import { bfs, newDAG } from './graph';

export class Engine {
  #options: EngineOptions;

  #actionKinds: Set<string>;

  constructor(options: EngineOptions) {
    this.#options = options;
    this.#actionKinds = new Set();
    this.actions = this.#options.actions || [];
  }

  /**
   * Returns all actions added to the engine
   *
   */
  get actions(): Array<EngineAction> {
    return this.#options.actions || [];
  }

  /**
   * Replaces all actions in the current engine
   *
   */
  set actions(actions: Array<EngineAction>) {
    this.#options.actions = actions;
    this.#actionKinds = new Set();
    for (let action of this.#options.actions) {
      if (this.#actionKinds.has(action.kind)) {
        throw new Error(`Duplicate action kind: ${action.kind}`);
      }
      this.#actionKinds.add(action.kind);
    }
  }

  /**
   * Returns all actions added to the engine
   *
   */
  get loader(): Loader | undefined {
    return this.#options.loader;
  }

  /**
   * Replaces all actions in the current engine
   *
   */
  set loader(loader: Loader) {
    this.#options.loader = loader;
  }


  /**
   * Graph returns a graph for the given workflow instance, and also ensures that the given
   * Workflow is valid and has no errors.
   *
   * It checks for cycles, disconnected vertices and edges, references are valid, and that
   * actions exist within the workflow instance.
   *
   * If the JSON is invalid, this throws an error.
   *
   */
  graph(flow: Workflow): DAG {
    for (let action of flow.actions) {
      if (!this.#actionKinds.has(action.kind)) {
        throw new Error("Workflow instance references unknown action kind: " + action.kind);
      }
      // TODO: Validate types, configuration, and so on.
    }

    const graph = newDAG(flow);

    // TODO: Validation
    // - BFS walk of each action, and ensure any refs to prior actions have already
    //   been visited.

    return graph
  }

  /**
   * run executes a new Workflow of a workflow durably, using the step tooling provided.
   *
   */
  run = async ({ event, step, workflow }: RunArgs): Promise<any> => {
    const { loader } = this.#options;
    if (!workflow && !loader) {
      throw new Error("Cannot run workflows without a workflow instance specified.");
    }
    if (!workflow && loader) {
      // Always load the workflow within a step so that it's declarative.
      workflow = await step.run(
        "Load workflow configuration",
        async () => {
          try {
            return await loader(event);
          } catch(e) {
            // TODO: Is this an WorkflowNotFound error?
          }
        },
      );
    }
    if (!workflow) {
      throw new Error("No workflow instance specified.");
    }

    let graph = this.graph(workflow);

    // Workflows use `step.run` to manage implicit step state, orchestration, and
    // execution, storing the ouput of each action within a custom state object for
    // mapping inputs/outputs between steps by references within action metadata.
    //
    // Unlike regular Inngest step functions, workflow instances have no programming flow
    // and so we must maintain some state mapping ourselves.
    let state = new ExecutionState({
      engine: this,
      graph,
      workflow,
      event,
      step,
    });
    await state.execute();
  }
}

export interface ExecutionOpts {
  engine: Engine;
  graph: DAG;
  workflow: Workflow;
  event: any;
  step: any;
}

/**
 * ExecutionState iterates through a given Workflow and graph, ensuring that we call
 * each action within the graph in order, durably.
 *
 * Because each action in a workflow can reference previous action's outputs and event data, it
 * also resolves references and manages action data. 
 *
 * Note that this relies on Inngest's step functionality for durability and function state
 * management.
 *
 */
export class ExecutionState {
  #opts: ExecutionOpts

  #state: Map<string, any>;

  constructor(opts: ExecutionOpts, state?: Record<string, any>) {
    this.#opts = opts;
    this.#state = new Map(Object.entries(state || {}));
 }

  execute = async () => {
    const { event, step, graph, workflow, engine } = this.#opts;

    await bfs(graph, async (action, edge) => {
      if (edge.if && !this.ref(edge.if)) {
        // Do not iterate through the edge, as it's an if which evaluated falsey.
        return;
      }
      if (edge.else && !!this.ref(edge.else)) {
        // Do not iterate through the edge, as it's an else which evaluated truthy.
        return;
      }

      // Find the base action from the workflow class.  This includes the handler
      // to invoke.
      const base = engine.actions.find((a) => a.kind === action.kind);
      if (!base) {
        throw new Error(`Unable to find workflow action for kind: ${action.kind}`);
      }

      // Invoke the action directly.
      //
      // Note: The handler should use Inngest's step API within handlers, ensuring
      // that nodes in the workflow execute once, durably.
      const result = await base.handler({
        event,
        step,
        workflow,
        workflowAction: this.resolveInputs(action),
      });

      // And set our state.  This may be a previously memoized output.
      this.#state.set(action.id, result);
    });
  }

  /**
   * resolveInputs itarates through the action configuration, updating any referenced
   * variables within the config.
   *
   */
  resolveInputs = (action: WorkflowAction) => {
    // For each action, check to see if it references any prior input.
    action.inputs ??= {};
    for (let key in action.inputs) {
      action.inputs[key] = this.ref(action.inputs[key]);
    }
    return action
  }

  ref = (value: any) => {
    if (typeof(value) !== "string" || value.indexOf("$ref:$") !== 0) {
      return value
    }
    let path = value.replace("$ref:", "")
    // This is a reference.  Grab the JSON path from the ref by removing "$ref:"
    // and grabbing the item from state.
    const result = jsonpath.query({
      event: this.#opts.event,
      state: Object.fromEntries(this.#state),
    }, path)

    if (!Array.isArray(result)) {
      return result
    }
    if (result.length === 0) {
      // Not found.
      return undefined;
    }
    if (result.length === 1) {
      return result[0]
    }
    return result;
  }
}
