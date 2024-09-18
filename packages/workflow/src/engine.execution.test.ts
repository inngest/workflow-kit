import { Engine } from "./engine";
import { Workflow } from "./types";
import { SourceNodeID } from "./graph";
import { Type } from '@sinclair/typebox'
import { builtinActions } from "./builtin";

test("execution", async () => {

  const engine = new Engine({
    actions: [
      ...Object.values(builtinActions),
      {
        kind: "multiply",
        name: "Multiply some numbers",
        handler: async (args) => {
          console.log("yee", args);
          return (args.workflowAction?.inputs?.a || 0) * (args.workflowAction?.inputs?.b || 0)
        },
        inputs: {
          a: {
            type: Type.Number({
              description: "Numerator",
            }),
          },
          b: {
            type: Type.Number({
              description: "Denominator",
            }),
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

      // Only continue if the result is 7*6
      {
        id: "if-a",
        kind: "builtin:if",
        name: "If A is 42",
        inputs: {
          condition: {
            "==": [
              "!ref($.state.stepA)",
              7*6,
            ],
          },
        },
      },

      {
        id: "stepB-true",
        kind: "multiply",
        name: "multiply result of A",
        inputs: {
          a: "!ref($.state.stepA)",
          b: "!ref($.event.data.age)",
        },
      },
      {
        id: "stepB-false",
        kind: "multiply",
        name: "Should never run.",
        inputs: {
          a: "!ref($.state.stepA)",
          b: "!ref($.event.data.age)",
        },
      },

      // Finally, run a conditional to match on numeric values.
      {
        id: "stepC",
        kind: "multiply",
        name: "Multiply 2 and 9",
        inputs: {
          a: 2,
          b: 9,
        },
      },
    ],
    edges: [
      { from: SourceNodeID, to: "stepA" },

      { from: "stepA", to: "if-a" },

      // Check "true" branches of the builtin:if action
      { from: "if-a", to: "stepB-true", conditional: { type: "if", ref: "!ref($.output.result)" } },
      // if-a should evaluate to true so this never runs.
      { from: "if-a", to: "stepB-false", conditional: { type: "else", ref: "!ref($.output.result)" } },

      // Check that "match" works with non-string values.
      { from: "stepB-true", to: "stepC", conditional: { type: "match", ref: "!ref($.output)", value: 42*99 } },
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
  expect(es.state.get("stepB-true")).toBe(42*99);
  expect(es.state.get("stepC")).toBe(2*9);

  // Shouldn't run, as the if-a step is true
  expect(es.state.get("stepB-false")).toBe(undefined);
})