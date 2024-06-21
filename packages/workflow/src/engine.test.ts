import { ExecutionState, type ExecutionOpts, Engine } from "./engine";

describe("Engine.graph", () => {

  const engine = new Engine({
    actions: [
      {
        kind: "send-email",
        handler: async ({ event, step, action }) => {
          await step.run("send the damn email", async () => {
            // ...
          })
        }
      }
    ]
  });

  /** TODO **/
  it("validates unknown action kinds", () => {});
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
