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
} from '@xyflow/react';
import { Workflow, WorkflowAction } from "../types";
import { useLayout } from './layout';
import { TriggerNode, ActionNode } from './Nodes';
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
  const { workflow, trigger, setSelectedNode } = useProvider();

  const flow = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  // Store a reference to the parent div to compute layout
  const ref = useRef<HTMLDivElement>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() =>
    parseWorkflow({ workflow, trigger }),
  [workflow, trigger]);

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

  const nodeTypes = useMemo(() => ({
    trigger: (node: any) => { // TODO: Define args type.
      const { trigger } = node.data;
      return <TriggerNode trigger={trigger} node={node} direction={direction} />
    },
    action: (node: any) => { // TODO: Define args type.
      const { action} = node.data;
      return <ActionNode action={action} node={node} direction={direction} />
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
          let target = event.target as HTMLElement, isNode = false;
          while (target !== ref.current) {
            if (target.classList.contains("wf-node")) {
              isNode = true;
            }

            target = target.parentElement as HTMLElement;
            if (!target) {
              break;
            }
          }

          if (!isNode) {
            setSelectedNode(undefined);
          }
        }}
        onNodeClick={(event, node) => {
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

const parseWorkflow = ({ workflow, trigger }: WorkflowProps & TriggerProps): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Add trigger node
  nodes.push({
    id: '$source',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { trigger }
  });

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