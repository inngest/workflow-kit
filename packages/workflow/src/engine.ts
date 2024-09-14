import {
  type RunArgs,
  type EngineOptions,
  type EngineAction,
  type WorkflowAction,
  type Loader,
  type Workflow,
  DAG,
  TriggerEvent,
} from "./types";
import { bfs, newDAG } from './graph';
import jsonpath from "jsonpath";
import { Type } from '@sinclair/typebox'
import { Value, AssertError } from '@sinclair/typebox/value'

export class Engine {
  #options: EngineOptions;

  #actionKinds: Set<string>;
  #actionMap: Record<string, EngineAction>

  constructor(options: EngineOptions) {
    this.#options = options;
    this.#actionKinds = new Set();
    this.#actionMap = {};
    this.actions = this.#options.actions || [];
  }

  /**
   * Returns all actions added to the engine
   *
   */
  get actions(): Record<string, EngineAction> {
    return this.#actionMap;
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
      this.#actionMap[action.kind] = action;
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

      // Validate that the action kind exists within the engine.
      if (!this.#actionKinds.has(action.kind)) {
        throw new Error("Workflow instance references unknown action kind: " + action.kind);
      }

      // Validate that the workflow action's input types match the expected
      // types defined on the engine's action
      for (const [name, input] of Object.entries((this.#actionMap[action.kind]?.inputs || {}))) {
        const wval = (action.inputs || {})[name];

        // If this is a ref, we can't yet validate as we don't have state.
        if (refs(wval).length === 0) {
          try {
            Value.Assert(input.type, wval)
          } catch(e) {
            throw new Error(`Action '${action.id}' has an invalid input for '${name}': ${(e as AssertError).message}`);
          }

          continue
        }

        // TODO: Ensure that refs are valid.

        // TODO: Attempt to grab the output type of the action this is referencing, if this
        // is an action, and validate that (recursively)
      }
    }

    const graph = newDAG(flow);
    return graph
  }

  /**
   * run executes a new Workflow of a workflow durably, using the step tooling provided.
   *
   */
  run = async ({ event, step, workflow }: RunArgs): Promise<ExecutionState> => {
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

    return state;
  }
}

export interface ExecutionOpts {
  engine: Engine;
  graph: DAG;
  workflow: Workflow;
  event: TriggerEvent;
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

  get state(): Map<string, any> {
    return this.#state;
  }

  execute = async () => {
    const { event, step, graph, workflow, engine } = this.#opts;

    await bfs(graph, async (action, edge) => {

      if (edge.conditional) {
        // TODO: Evaluate conditional.
        return;
      }

      // Find the base action from the workflow class.  This includes the handler
      // to invoke.
      const base = engine.actions[action.kind];
      if (!base) {
        throw new Error(`Unable to find workflow action for kind: ${action.kind}`);
      }

      // Invoke the action directly.
      //
      // Note: The handler should use Inngest's step API within handlers, ensuring
      // that nodes in the workflow execute once, durably.
      const workflowAction = { ...action, inputs: this.resolveInputs(action) };

      const result = await base.handler({
        event,
        step,
        workflow,
        workflowAction,
        state: this.#state,
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
  resolveInputs = (action: WorkflowAction): Record<string, any> => {
    // For each action, check to see if it references any prior input.
    return resolveInputs(action.inputs ?? {}, Object.fromEntries(this.#state), this.#opts.event);
  }

  interpolate = (value: any): any => {
    return interpolate(value, Object.fromEntries(this.#state), this.#opts.event)
  }

}

export const resolveInputs = (
  inputs: Record<string, any>,
  state: Record<string, any>,
  event: TriggerEvent,
): Record<string, any> => {
  const outputs: Record<string, any> = {};
  for (let key in (inputs ?? {})) {
    outputs[key] = interpolate(inputs[key], state, event);
  }
  return outputs
}

export function interpolate(value: any, state: Record<string, any>, event: TriggerEvent) {
  let result = value;
  let foundRefs = refs(result)

  if (isRef(result)) {
    // Handle pure references immediately.  Remove "!ref(" and ")"
    result = result.replace("!ref(", "")
    result = result.substring(0, result.length-1)
    return interpolatedRefValue(result, state, event);
  }

  // This is a string which contains refs as values within content,
  // eg. "Hello !ref($.event.data.name)".
  while (foundRefs.length > 0) {
    // Replace the ref with the interpolated value.
    let { path: jsonPath, ref: substr } = foundRefs.shift() ?? { path: "", ref: "" };
    result = result.replace(substr, interpolatedRefValue(jsonPath, state, event))
  }

  return result
}

function interpolatedRefValue(path: string, state: Record<string, any>, event: TriggerEvent) {
  const value = jsonpath.query({ state, event }, path)
  if (!Array.isArray(value)) {
    return value
  }
  if (value.length === 0) {
    // Not found in state, so this is undefined.
    return undefined;
  }
  // JSON-path always returns an array containing the embedded results.  The first
  // el is the result.
  if (value.length === 1) {
    return value[0]
  }
  return value;
}


// isRef returns true if the input is a reference, like !ref($state.foo).  We handle
// pure refs differently than strings which contain refs as part of the value.
function isRef(input: string) {
  if (typeof(input) !== "string" || input.indexOf("!ref($.") !== 0) {
    return false
  }
  return input.substring(input.length-1) === ")"
}

function refs(input: any): Array<{ path: string, ref: string }> {
  if (typeof(input) !== "string") {
    return []
  }
  // Ensure that the ref matches a proper regex.
  let result = []
  for (const match of  input.matchAll(/\!ref\((\$.[\w\.]+)\)/g)) {
    if (match[1]) {
      // Push the JSON path and the original ref, to make substring
      // replacement easier.
      result.push({ path: match[1], ref: match[0] })
    }
  }
  return result
}