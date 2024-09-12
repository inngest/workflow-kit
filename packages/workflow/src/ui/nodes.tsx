import {
  Handle,
  Position,
  Node,
  HandleProps,
} from '@xyflow/react';
import { WorkflowAction } from "../types";
import { TriggerProps, Direction } from "./Editor";
import { useProvider } from './Provider';


export type TriggerNodeProps = TriggerProps & {
  direction: Direction;
  node: Node;
};

/**
 * TriggerNode represents the trigger of the workflow.
 * 
 * @param trigger - The trigger within the workflow.
 * @param direction - The direction of the workflow, used to determine how handles are placed.
 */
export const TriggerNode = ({ trigger, node, direction }: TriggerNodeProps) => {
  const { setSelectedNode } = useProvider();

  return (
    <div
      onClick={() => {
        setSelectedNode(node);
      }}
      className={`wf-node wf-trigger-node wf-cursor-pointer`}
    >
      <p>{ trigger === undefined ? "Select a trigger" : trigger?.event?.name }</p>
      <AddHandle {...sourceHandleProps(direction)} />
    </div>
  );
}

export type ActionNodeProps = {
  action: WorkflowAction,
  node: Node,
  direction: Direction
}

/**
 * ActionNode represents a single action in the workflow.
 * 
 * @param action - The action within the workflow that this node represents.
 * @param direction - The direction of the workflow, used to determine how handles are placed.
 */
export const ActionNode = ({ action, node, direction }: ActionNodeProps) => {
  const { setSelectedNode } = useProvider();

  return (
    <div
      className='wf-node wf-action-node'
      onClick={() => {
        setSelectedNode(node);
      }}
    >
        <Handle {...targetHandleProps(direction)} />
        {action.name || action.id}
        <AddHandle {...sourceHandleProps(direction)} />
    </div>
  );
}

const AddHandle = ({ ...props }: HandleProps) => (
  <Handle {...props} className="wf-add-handle">
    <div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </Handle>
);

const targetHandleProps = (direction: Direction): HandleProps & { key: string }=> {
  return {
    type: "target",
    position: direction === "down" ? Position.Top : Position.Left,
    key: direction,
    className: "wf-target-handle",
  }
}

const sourceHandleProps = (direction: Direction): HandleProps & { key: string } => {
  return {
    type: "source",
    position: direction === "down" ? Position.Bottom : Position.Right,
    key: direction,
  }
}