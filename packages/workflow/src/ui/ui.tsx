import React, { useEffect, useMemo, useRef } from 'react';
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
import { TriggerNode, ActionNode } from './nodes';

export const Provider = () => {
  return (
    <div>
    </div>
  );
}

type EditorProps = WorkflowProps & TriggerProps & {
  direction: Direction;

  // onChange is called when the workflow is changed via any interactivity
  // with the workflow editor.  This may be called many times on any update.
  //
  // Note that this does not imply that you must save the workflow.  You may
  // store the workflow in an internal state and only save when the user
  // hits a save button.
  onChange?: (w: Workflow) => {};

  // Allows users to customize the onClick handler on the event.
  onTriggerClick?: () => void;

  // Allows users to customize the onClick handler on the action nodes.
  onActionClick?: (action: WorkflowAction) => void;

  // TODO: spacing
  // TODO: branching boolean; by default it's a linear workflow.
}

export type TriggerProps = {
  trigger?: any; // TODO: Define trigger type.
}

type WorkflowProps = {
  workflow?: Workflow;
}

export type Direction = "right" | "down";

export const Editor = (props: EditorProps) => {
  // Force the correct enum if the user passes in a string via non-TS usage.
  const direction = props.direction === "right" ? "right" : "down";

  return (
    <ReactFlowProvider>
      <EditorUI {...props} direction={direction} />
    </ReactFlowProvider>
  );
}

const EditorUI = ({ workflow, trigger, onChange, onTriggerClick, direction }: EditorProps) => {
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
    console.log("fitRect", fitRect);

    flow.fitBounds(fitRect);
  }, [nodesInitialized]);

  const nodeTypes = useMemo(() => ({
    trigger: (args: any) => { // TODO: Define args type.
      const { trigger } = args.data;
      return <TriggerNode trigger={trigger} onTriggerClick={onTriggerClick} {...args} direction={direction} />
    },
    action: (args: any) => { // TODO: Define args type.
      const { action} = args.data;
      return <ActionNode action={action} {...args} direction={direction} />
    }
  }), [direction]);

  return (
    <div className="wf-editor" ref={ref}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={(args) => {
          // Required to store .measured in nodes for computing layout.
          onNodesChange(args);
        }}
        key={direction}
        proOptions={{ hideAttribution: true }}
      >
      </ReactFlow>
    </div>
  );
};

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
