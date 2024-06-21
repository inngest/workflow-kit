import { DirectedGraph } from "graphology";
import hasCycle from 'graphology-dag/has-cycle';
import { InstanceAction, type Instance, type InstanceEdge, type Node, type Edge, type DAG } from "./types";

const sourceNodeID = "$source";

export const newDAG = (flow: Instance): DAG => {
  const g = new DirectedGraph<Node, Edge>();

  // Always add the triggering event as a source node.
  g.mergeNode(sourceNodeID, { id: sourceNodeID, kind: sourceNodeID });

  for (let action of flow.actions) {
    if (g.hasNode(action.id)) {
      throw new Error(`Workflow has two actions with the same ID: ${action.id}`);
    }
    g.addNode(action.id, { id: action.id, kind: "$action", action });
  }
  for (let edge of flow.edges) {
    if (!g.hasNode(edge.from)) {
      throw new Error(`Workflow references an unknown action: ${edge.from}`);
    }
    if (!g.hasNode(edge.to)) {
      throw new Error(`Workflow references an unknown action: ${edge.to}`);
    }
    g.addEdge(edge.from, edge.to, { edge });
  }

  if (hasCycle(g)) {
    throw new Error("Workflow instances must be a DAG;  the given workflow has at least one cycle.");
  }

  g.forEachNode((id, attrs) => {
    if (id !== sourceNodeID && g.inEdges(id).length === 0) {
      throw new Error(`An action is disconnected and will never run: ${attrs?.action?.id || id}`);
    }
  });

  return g;
}

export const bfs = async (graph: DAG, cb: (node: InstanceAction, edge: InstanceEdge) => Promise<any>): Promise<any> => {
  if (graph.order <= 1) {
    // Only the event/source exists; do nothing.
    return;
  };

  const queue: Array<string> = [sourceNodeID];
  const seen = new Set<string>();

  while (queue.length > 0) {
    let next = queue.shift();
    const nodes: Array<Node> = [];

    // Iterate through all children given the parent node in the queue, then push these
    // into a list for processing.
    graph.forEachOutNeighbor(next, (id, node) => {
      if (seen.has(id)) {
        return;
      }
      // We want to iterate into each action afterwards, outside of this function
      // for async support.
      nodes.push(node);
      // And we want to do a BFS search down the tree itself.
      queue.push(id);
    });

    // For each child node found, start processing the actions.  `cb` should include Inngest's
    // step.run tooling for deterministic durability, here.
    for (let node of nodes) {
      if (!node.action) {
        // We don't need to process anything here.
        continue;
      }

      const iter = graph.edgeEntries(next, node.id);
      const edge = iter.next();
      if (!edge || edge?.done == true) {
        // Should never happen due to DAG validation.
        throw new Error(`Error finding edge during DAG iteration: ${next} -> ${node.id}`);
      }

      await cb(node.action, edge.value.attributes.edge as InstanceEdge);
    }
  }

}
