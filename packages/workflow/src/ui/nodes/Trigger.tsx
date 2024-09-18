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
  const { selectedNode, workflow } = useProvider();

  const isSelected = selectedNode?.type === "trigger";

  return (
    <div
      className={`wf-node wf-trigger-node wf-cursor-pointer ${isSelected ? "wf-node-selected" : ""}`}
    >
      <div className="wf-node-title">
        <div className="wf-node-icon">
          <Icon />
        </div>
        <p>{ trigger === undefined ? "Select a trigger" : trigger?.event?.name }</p>
      </div>

      <p className="wf-node-description">{ workflow?.description || "Starts the workflow" }</p>

      { trigger && <AddHandle {...sourceHandleProps(direction)} node={node}/> }
    </div>
  );
}

const Icon = () => (
  <svg width="20" height="20" fill="none">
    <path
      fill="#9B9B9B"
      d="M5.5 17.125a2.625 2.625 0 1 1 2.516-3.375h4.234v-1.5h1.5V7.932L12.068 6.25H7.75v1.5h-4.5v-4.5h4.5v1.5h4.318L14.5 2.317 17.682 5.5 15.25 7.93v4.32h1.5v4.5h-4.5v-1.5H8.016A2.626 2.626 0 0 1 5.5 17.125Zm0-3.75a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm9.75.375h-1.5v1.5h1.5v-1.5Zm-.75-9.31L13.44 5.5l1.06 1.06 1.06-1.06-1.06-1.06Zm-8.25.31h-1.5v1.5h1.5v-1.5Z"
    />
  </svg>
)