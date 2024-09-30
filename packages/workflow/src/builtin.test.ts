import { builtinActions } from "./builtin";
import { resolveInputs } from "./interpolation";
import {
  ActionHandler,
  ActionHandlerArgs,
  Workflow,
  WorkflowAction,
} from "./types";

describe("builtin:if", () => {
  // This tests the handler logic of the builtin:if action.
  const action = builtinActions["builtin:if"];
  if (!action) {
    throw new Error("builtin:if action not found");
  }

  it("evaluates simple conditions without refs", async () => {
    const workflowAction: WorkflowAction = {
      id: "1",
      kind: "builtin:if",
      inputs: {
        condition: { "==": [1, 1] },
      },
    };

    let result = await action.handler(handlerInput(workflowAction));
    expect(result).toEqual({ result: true });

    workflowAction.inputs = { condition: { "==": [2, 1] } };
    result = await action.handler(handlerInput(workflowAction));
    expect(result).toEqual({ result: false });
  });

  it("evaluates complex conditions with refs", async () => {
    const state = new Map(Object.entries({ action_a: 1.123 }));
    const event = { data: { name: "jimothy" } };

    const workflowAction: WorkflowAction = {
      id: "1",
      kind: "builtin:if",
      inputs: resolveInputs(
        {
          condition: {
            and: [
              { "==": ["!ref($.state.action_a)", 1.123] },
              { "==": ["!ref($.event.data.name)", "jimothy"] },
            ],
          },
        },
        { state: Object.fromEntries(state), event }
      ),
    };

    let result = await action.handler({
      workflowAction,
      event,
      state,
      step: {} as any,
      workflow: {
        actions: [workflowAction],
        edges: [],
      },
    });

    expect(result).toEqual({ result: true });
  });

  const handlerInput = (workflowAction: WorkflowAction): ActionHandlerArgs => {
    return {
      workflowAction,
      event: {
        data: {
          age: 82.1,
          likes: ["a"],
        },
      },
      step: {},
      workflow: {
        actions: [workflowAction],
        edges: [],
      },
      state: new Map(),
    };
  };
});
