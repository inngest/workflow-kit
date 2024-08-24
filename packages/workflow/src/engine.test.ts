import { ExecutionState, type ExecutionOpts, Engine } from "./engine";
import { Workflow } from "./types";

describe("Engine.graph", () => {

  const engine = new Engine({
    actions: [
      {
        kind: "send-email",
        handler: async () => {}, // noop
        inputs: {
          email: {
            // TODO: Define how the UI should work here.
          },
        },
        outputs: {
          emailId: "TODO",
        },
      }
    ]
  });

  it("validates unknown action kinds", () => {
    const wf: Workflow = {
      actions: [
        { id: "a", kind: "not-found-in-engine" }
      ],
      edges: [
        { from: "$source", to: "a" },
      ],
    }

    expect(() => engine.graph(wf)).toThrow(
      "Workflow instance references unknown action kind"
    );
  });

  it ("validates that there are source edges", () => {
    const wf: Workflow = {
      actions: [
        { id: "a", kind: "send-email" },
        { id: "b", kind: "send-email" },
      ],
      edges: [
        { from: "a", to: "b" },
      ],
    }

    expect(() => engine.graph(wf)).toThrow(
      "Workflow has no starting actions"
    );
  })

  it ("validates that there are no disconnected actions", () => {
    const wf: Workflow = {
      actions: [
        { id: "a", kind: "send-email" },
        { id: "b", kind: "send-email" },
      ],
      edges: [
        { from: "$source", to: "a" },
      ],
    }

    expect(() => engine.graph(wf)).toThrow(
      "An action is disconnected and will never run: b"
    );
  })


  it ("validates that there are no cycles or self-references", () => {
    const wf: Workflow = {
      actions: [
        { id: "a", kind: "send-email" },
        { id: "b", kind: "send-email" },
      ],
      edges: [
        { from: "a", to: "a" },
      ],
    }

    expect(() => engine.graph(wf)).toThrow(
      "Workflow instance must be a DAG;  the given workflow has at least one cycle."
    );
  })


  it("validates parent refs", () => {});
  it("validates action input types", () => {});
});

describe("ExecutionState.ref", () => {
  it("correctly references current state and events", () => {
    let state = new ExecutionState(
      {
        event: {
          data: {
            userId: 1,
            likes: ["a"],
          }
        },
      } as ExecutionOpts,
      {
        action_a: "test",
        action_b: { ok: true },
        action_c: 42,
      },
    );

    expect(state.ref("$ref:$.event.data.userId")).toEqual(1);
    expect(state.ref("$ref:$.event.data.likes")).toEqual(["a"]);
    expect(state.ref("$ref:$.state.action_a")).toEqual("test");
    expect(state.ref("$ref:$.state.action_b")).toEqual({ ok: true });

    expect(state.ref("$ref:$.state.not_found")).toEqual(undefined);

    expect(state.ref("lol")).toEqual("lol");
    expect(state.ref(123)).toEqual(123);
    expect(state.ref([123])).toEqual([123]);
  })
});

describe("ExecutionState.run", () => {
  it("executes actions", () => {
  });
});
