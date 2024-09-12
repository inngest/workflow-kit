import { Engine } from "./engine";
import { Workflow } from "./types";
import { SourceNodeID } from "./graph";
import { Type } from '@sinclair/typebox'

test("execution", async () => {

  const engine = new Engine({
    actions: [
      {
        kind: "multiply",
        name: "Multiply some numbers",
        handler: async (args) => {
          return (args.workflowAction?.inputs?.a || 0) * (args.workflowAction?.inputs?.b || 0)
        },
        inputs: {
          a: {
            type: Type.Number(),
            description: "Numerator",
          },
          b: {
            type: Type.Number(),
            description: "Denominator",
          },
        },
        outputs: Type.Number(),
      }
    ]
  });

  const workflow: Workflow = {
    actions: [
      {
        id: "stepA",
        kind: "multiply",
        name: "Multiply some numbers",
        inputs: {
          a: 7,
          b: 6,
        },
      },
      {
        id: "stepB",
        kind: "multiply",
        name: "multiply result of A",
        inputs: {
          a: "!ref($.state.stepA)",
          b: "!ref($.event.data.age)",
        },
      },
    ],
    edges: [
      { from: SourceNodeID, to: "stepA" },
      { from: "stepA", to: "stepB" },
    ],
  };

  const es = await engine.run({
    workflow,
    event: {
      name: "auth/user.created",
      data: {
        name: "test user",
        age: 99,
      }
    },
    step: {},
  });

  expect(es.state.get("stepA")).toBe(42);
  expect(es.state.get("stepB")).toBe(42*99);
})