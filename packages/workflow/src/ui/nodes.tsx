import {
  Handle,
  Position,
  HandleProps,
} from '@xyflow/react';
import { WorkflowAction } from "../types";
import { TriggerProps, Direction } from "./ui";


type TriggerNodeProps = TriggerProps & {
  onTriggerClick?: () => void;
  direction: Direction;
};

/**
 * TriggerNode represents the trigger of the workflow.
 * 
 * @param trigger - The trigger within the workflow.
 * @param direction - The direction of the workflow, used to determine how handles are placed.
 */
export const TriggerNode = ({ trigger, onTriggerClick, direction }: TriggerNodeProps) => {
  const className = onTriggerClick ? "wf-cursor-pointer" : "";

  if (trigger === undefined) {
    return (
      <div
        onClick={onTriggerClick}
        className={`wf-node wf-trigger-node wf-trigger-node-empty ${className}`}
      >
        <p>Select a trigger</p>

        {/* If there are no child actions, there should be a single "add" handle in the center. */}
        <AddHandle {...sourceHandleProps(direction)} />
      </div>
    );
  }

  // TODO
  return (
    <div
      className={`wf-node wf-trigger-node ${className}`}
      onClick={onTriggerClick}
    >
      <p>Trigger</p>
    </div>
  );
}


/**
 * ActionNode represents a single action in the workflow.
 * 
 * @param action - The action within the workflow that this node represents.
 * @param direction - The direction of the workflow, used to determine how handles are placed.
 */
export const ActionNode = ({ action, direction }: { action: WorkflowAction, direction: Direction }) => {
  return (
    <div className='wf-node wf-action-node'>
        <Handle {...targetHandleProps(direction)} />
        {action.name || action.id}
        <AddHandle {...sourceHandleProps(direction)} />
    </div>
  );
}

const AddHandle = ({ ...props }: HandleProps) => (
  <Handle {...props} className="wf-add-handle">
    <div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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