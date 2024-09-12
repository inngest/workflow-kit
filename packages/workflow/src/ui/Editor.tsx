import React, { useEffect, useMemo, useRef, useContext } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  useNodesInitialized,
  Rect,
} from '@xyflow/react';
import { Workflow, WorkflowAction } from "../types";
import { getLayoutedElements, useLayout } from './layout';
import { TriggerNode, ActionNode, BlankNode } from './Nodes';
import { useProvider, useSidebarPosition, useTrigger, useWorkflow } from './Provider';

export type EditorProps = {
  direction: Direction;
  children?: React.ReactNode;
}

export type Direction = "right" | "down";

export const Editor = (props: EditorProps) => {
  // Force the correct enum if the user passes in a string via non-TS usage.
  const direction = props.direction === "right" ? "right" : "down";
  const sidebarPosition = useSidebarPosition();

  let className = sidebarPosition === "left" ? "wf-editor-left-sidebar" : "";

  return (
    <ReactFlowProvider>
      <div className={`wf-editor ${className}`}>
        <EditorUI {...props} direction={direction} />
        {props.children}
      </div>
    </ReactFlowProvider>
  );
}

const EditorUI = ({ direction }: EditorProps) => {
  const { workflow, trigger, setSelectedNode, blankNode, setBlankNode } = useProvider();
  const nodesInitialized = useNodesInitialized();

  // Store a reference to the parent div to compute layout
  const ref = useRef<HTMLDivElement>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() =>
    parseWorkflow({ workflow, trigger }),
  [workflow, trigger, blankNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Lay out the nodes in the graph.
  const layoutRect = useLayout({
    nodes: nodes,
    edges: edges,
    width: ref.current?.offsetWidth ?? 0,
    height: ref.current?.offsetHeight ?? 0,
    direction,
    setNodes,
    setEdges,
    nodesInitialized,
  });

  useHandleBlankNode(nodes, edges, setNodes, setEdges, direction);
  useCenterGraph(layoutRect, ref);

  const nodeTypes = useMemo(() => ({
    trigger: (node: any) => { // TODO: Define args type.
      const { trigger } = node.data;
      return <TriggerNode trigger={trigger} node={node} direction={direction} />
    },
    action: (node: any) => { // TODO: Define args type.
      const { action} = node.data;
      return <ActionNode action={action} node={node} direction={direction} />
    },
    blank: () => {
      return <BlankNode direction={direction} />
    }
  }), [direction]);

  return (
    <div className="wf-editor-parent" ref={ref}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onClick={(event) => {
          // If the event target is not a node, set the selected node to undefined.
          let target = event.target as HTMLElement,
            isNode = false,
            isBlank = false;

          const results = searchParents(target, ["wf-node", "wf-blank-node"], ref.current);

          if (!results["wf-blank-node"] && !!blankNode) {
            // Remove the blank node, as we've clicked elsewhere.
            setBlankNode(undefined);
          }
          if (!results["wf-node"]) {
            // Unselect any selected node, as we're not clicking on a node.
            setSelectedNode(undefined);
          }
        }}
        onNodeClick={(event, node) => {
          // Ensure we're not clicking the "add" handle.  When we click
          // the add handle, we automatically select the blank node.  Selecting
          // the node here would override that selection.
          const results = searchParents(event.target as HTMLElement, ["wf-add-handle"], ref.current);
          if (results["wf-add-handle"]) {
            return;
          }

          setSelectedNode(node);
          event.preventDefault();
        }}
        onNodesChange={(args) => {
          // Required to store .measured in nodes for computing layout.
          onNodesChange(args);
        }}
        key={direction}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
};

export type TriggerProps = {
  trigger?: any; // TODO: Define trigger type.
}

export type WorkflowProps = {
  workflow?: Workflow;
}

type parseWorkflowProps = WorkflowProps & TriggerProps & { blankNodeParent?: Node }

const parseWorkflow = ({ workflow, trigger, blankNodeParent }: parseWorkflowProps): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Add trigger node
  nodes.push({
    id: '$source',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { trigger }
  });

  // Always handle the blank node case.
  if (blankNodeParent) {
    nodes.push({
      id: '$blank',
      type: 'blank',
      position: { x: 0, y: 0 },
      data: { parent: blankNodeParent }
    });
    edges.push({
      id: `blank-node-edge`,
      source: blankNodeParent.id,
      target: '$blank',
    });
  }

  if (!workflow) {
    return { nodes, edges };
  }

  (workflow.actions || []).forEach((action, index) => {
    nodes.push({
      id: action.id,
      type: 'action',
      position: { x: 0, y: 0 },
      data: { action }
    });
  });

  (workflow.edges || []).forEach((edge) => {
    edges.push({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
    });
  });

  // TODO: Always add an end node to every sink.
  return { nodes, edges };
};

const useCenterGraph = (layoutRect: Rect, ref: React.RefObject<HTMLDivElement>) => {
  const flow = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  useEffect(() => {
    if (!nodesInitialized) {
      return
    }

    // If the workflow is too big for the current viewport, zoom out.
    // Otherwise, don't zoom in and center the current graph.
    if (
      (layoutRect?.width > (ref.current?.offsetWidth ?? 0))
      || (layoutRect?.height > (ref.current?.offsetHeight ?? 0))
    ) {
      flow.fitView();
      return;
    }

    const w = ref.current?.offsetWidth ?? 0;
    const h = ref.current?.offsetHeight ?? 0;
    if (w === 0 || h === 0) {
      return;
    }

    const fitRect = {
      x: -1 * (w - layoutRect.width) / 2, // center the node rect in the viewport
      y: -1 * (h - layoutRect.height) / 2,
      width: w, // use viewport width
      height: h, // use viewport height
    }

    flow.fitBounds(fitRect);
  }, [nodesInitialized]);
}

// useHandleBlankNode is a hook that handles the logic for adding and removing
// blank nodes in a graph.
//
// Blank nodes are added when clicking the "AddHandle".  This mutates the Provider
// state, which we then listen to here in order to manipulate react flow.
const useHandleBlankNode = (
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  direction: Direction,
) => {
  const { blankNode } = useProvider();

  useEffect(() => {
    // We must manually update the react-flow nodes and edges as they're controlled
    // via internal state.
    if (blankNode) {
      // Add the blank node and its edge.

      // Ensure that the blank node's measured entry is filled. This fixes a layout bug shift.
      // Measured is undefined when a node is being added, and is filled after react-flow renders
      // the node for the first time.
      if (!blankNode.measured) {
        blankNode.measured = nodes[0]?.measured;
      }

      const newNodes = [...nodes, blankNode];
      const newEdges = [...edges, {
        id: `blank-node-edge`,
        source: blankNode.data.parent.id,
        target: '$blank',
      }];

      // Re-layout the graph prior to re-rendering.
      const result = getLayoutedElements(newNodes, newEdges, direction);

      setNodes(result.nodes);
      setEdges(result.edges);
    } else {
      // Remove the blank node and its edge.
      setNodes(nodes.filter((node) => node.id !== '$blank'));
      setEdges(edges.filter((edge) => edge.target !== '$blank'));
    }
  }, [blankNode]);
}


// searchParents is a utility to search parent elements for given clasnames.  It returns
// a record of whether each class was found.
const searchParents = (target: HTMLElement, search: string[], until?: HTMLElement | null): Record<string, boolean> => {
  const result: Record<string, boolean> = {};

  while (target !== until) {
    for (const key of search) {
      if (target.classList.contains(key)) {
        result[key] = true;
      }
    }
    target = target.parentElement as HTMLElement;
    if (!target) {
      break;
    }
  }

  return result;
}