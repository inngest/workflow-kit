import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import { Workflow } from "../types";

export const Provider = () => {
  return (
    <div>
    </div>
  );
}

type Props = {
  direction: "right" | "down";
  workflow?: any;
  event?: any;
  onChange?: (w: Workflow) => {};

  // Allows users to customize the onClick handler on the event.
  onTriggerClick?: () => {};
}

export const Editor = ({ workflow, trigger, onChange }) => {

  const nodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    action: ActionNode,
  }), []);

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
    />
  );
};

const nodes = ({ workflow, trigger }) => {
  if (!workflow && !trigger) {
    // TODO: render a blank "pick an event" node.
  }
  if (trigger) {
    // TODO: Add trigger node.
  }
  if (workflow) {
    // TODO: Parse workflow
  }
}

const TriggerNode = ({ trigger }) => {


  // TODO
  return (
    <div>
    </div>
  );
}

const ActionNode = () => {
  // TODO
  return (
    <div>
    </div>
  );
}
