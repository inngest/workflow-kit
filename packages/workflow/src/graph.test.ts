import { bfs, newDAG } from "./graph";
import { type Workflow } from "./types";

describe("newDAG validation", () => {

  it("validates disconnected actions", () => {
    const t = () => newDAG({
      actions: [{ id: "a", kind: "test" }, { id: "b", kind: "test" }],
      edges: [{ from: "$source", to: "a" }],
    })
    expect(t).toThrow(/An action is disconnected and will never run: b/)
  });

  it("correctly detects cycles", () => {
    const t = () => newDAG({
      actions: [{ id: "a", kind: "test" }, { id: "b", kind: "test" }],
      edges: [{ from: "$source", to: "a" }, { from: "a", to: "b" }, { from: "b", to: "a" }],
    })
    expect(t).toThrow(/workflow has at least one cycle/)
  });

  it("validates duplicate action ids", () => {
    const t = () => newDAG({
      actions: [{ id: "a", kind: "test" }, { id: "a", kind: "test" }],
      edges: [{ from: "$source", to: "a" }],
    })
    expect(t).toThrow("Workflow has two actions with the same ID: a")
  });

  it("validates invalid edges with invalid to", () => {
    const t = () => newDAG({
      actions: [{ id: "a", kind: "test" }],
      edges: [{ from: "$source", to: "a" }, { from: "a", to: "wat_is_this" }],
    })
    expect(t).toThrow("Workflow references an unknown action: wat_is_this")
  });

  it("validates invalid edges with invalid from", () => {
    const t = () => newDAG({
      actions: [{ id: "a", kind: "test" }],
      edges: [{ from: "$source", to: "a" }, { from: "wat_is_this", to: "a" }],
    })
    expect(t).toThrow("Workflow references an unknown action: wat_is_this")
  });
});

test("bfs with a single node", async () => {
  const node = { id: "a", "kind": "test" };
  const edge = { from: "$source", to: "a" };

  const dag = newDAG({ actions: [node], edges: [edge], });

  let hits = 0;
  await bfs(dag, async (n, e) => {
    hits++;
    expect(e).toEqual(edge);
    expect(n).toEqual(node);
  });
  expect(hits).toEqual(1);

});


test("bfs with a tree single node", async () => {
  const a1     = { id: "a1", "kind": "test" };
  const a2     = { id: "a2", "kind": "test" };
  const a1b1   = { id: "a1b1", "kind": "test" };
  const a1b2   = { id: "a1b2", "kind": "test" };
  const a1b2c1 = { id: "a1b2c1", "kind": "test" };

  const dag = newDAG({
    actions: [a1, a2, a1b1, a1b2, a1b2c1],
    edges: [
      // NOTE: The A2 edge comes first, so we expect to hit this first.
      { from: "$source", to: "a2" },
      { from: "$source", to: "a1" },
      { from: "a1", to: "a1b1" },
      { from: "a1", to: "a1b2" },
      { from: "a1b2", to: "a1b2c1" },
    ],
  });

  let hits = 0;
  await bfs(dag, async (n, _e) => {
    // Assert the order is deterministic, based off of edge ordering.
    switch (hits) {
    case 0:
      expect(n).toEqual(a2);
      break;
    case 1:
      expect(n).toEqual(a1);
      break;
    case 2:
      expect(n).toBe(a1b1);
      break;
    case 3:
      expect(n).toBe(a1b2);
      break;
    case 4:
      expect(n).toBe(a1b2c1);
      break;
    }
    hits++;
  });

  expect(hits).toEqual(5);
});

test("bfs with a tree that has multiple paths to the same node", async () => {
  const a1     = { id: "a1", "kind": "test" };
  const a2     = { id: "a2", "kind": "test" };
  const a1b1   = { id: "a1b1", "kind": "test" };
  const a1b2   = { id: "a1b2", "kind": "test" };

  const dag = newDAG({
    actions: [a1, a2, a1b1, a1b2],
    edges: [
      { from: "$source", to: "a1" },
      { from: "a1", to: "a1b1" },
      { from: "a1", to: "a1b2" },
      { from: "a1b2", to: "a2" },
      { from: "a1b1", to: "a2" },
    ],
  });

  // The tree should be:
  //     a1
  //    /  \ 
  // a1b1  a1b2
  //    \  /
  //     a2

  let hits = 0;
  await bfs(dag, async (n, _e) => {
    // Assert the order is deterministic, based off of edge ordering.
    switch (hits) {
    case 0:
      expect(n).toEqual(a1);
      break;
    case 1:
      expect(n).toEqual(a1b1);
      break;
    case 2:
      expect(n).toBe(a1b2);
      break;
    case 3:
      expect(n).toBe(a2);
      break;
    }
    hits++;
  });

  // a2 should not be hit twice
  expect(hits).toEqual(4);
});

test("bfs with conditionals", async () => {
  const a1     = { id: "a1", "kind": "test" };
  const a2     = { id: "a2", "kind": "test" };
  const a3     = { id: "a3", "kind": "test" };

  const dag = newDAG({
    actions: [a1, a2, a3],
    edges: [
      { from: "$source", to: "a1" },
      { from: "a1", to: "a2", conditional: { type: "if", ref: "!ref($.output)", value: true }},
      { from: "a1", to: "a3", conditional: { type: "else", ref: "!ref($.output)", value: false }},
    ],
  });

  let hits = 0;
  let visited: string[] = [];
  await bfs(dag, async (n, _e) => {
    // Assert the order is deterministic, based off of edge ordering, and that a3 is never encountered.
    switch (hits) {
    case 0:
      expect(n).toEqual(a1);
      break;
    case 1:
      expect(n).toEqual(a2);
      break;
    }
    visited.push(n.id);
    hits++;
  }, (edge) => {
    if (edge.conditional?.type === "if") {
      return true;
    }
    if (edge.conditional?.type === "else") {
      return false;
    }
    return true
  });

  expect(hits).toEqual(2);
  expect(visited).toEqual(["a1", "a2"]);

  const a4     = { id: "a4", "kind": "test" };
  const a5     = { id: "a5", "kind": "test" };

  const dag2 = newDAG({
    actions: [a1, a2, a3, a4, a5],
    edges: [
      { from: "$source", to: "a1" },
      { from: "a1", to: "a2", conditional: { type: "if", ref: "!ref($.output)", value: true }},
      { from: "a1", to: "a3", conditional: { type: "else", ref: "!ref($.output)", value: false }},
      { from: "a2", to: "a4" },
      { from: "a3", to: "a5" },
    ],
  });

  hits = 0;
  visited = [];
  await bfs(dag2, async (n, _e) => {
    // Assert the order is deterministic, based off of edge ordering, and that a3 and a5 are never encountered.
    switch (hits) {
      case 0:
        expect(n).toEqual(a1);
        break;
      case 1:
        expect(n).toEqual(a2);
        break;
      case 2:
        expect(n).toBe(a4);
        break;
    }
    visited.push(n.id);
    hits++;
  }, (edge) => {
    if (edge.conditional?.type === "if") {
      return true;
    }
    if (edge.conditional?.type === "else") {
      return false;
    }
    return true
  });

  expect(hits).toEqual(3);
  expect(visited).toEqual(["a1", "a2", "a4"]);
})