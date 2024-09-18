import { TriggerProps, Direction } from "../Editor";
import { useProvider } from "../Provider";
import { Node } from "@xyflow/react";
import { AddHandle, sourceHandleProps } from "./Handles";

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
  const { selectedNode } = useProvider();

  const isSelected = selectedNode?.type === "trigger";

  return (
    <div
      className={`wf-node wf-trigger-node wf-cursor-pointer ${isSelected ? "wf-node-selected" : ""}`}
    >
      <p>{ trigger === undefined ? "Select a trigger" : trigger?.event?.name }</p>
      { trigger && <AddHandle {...sourceHandleProps(direction)} node={node}/> }
    </div>
  );
}