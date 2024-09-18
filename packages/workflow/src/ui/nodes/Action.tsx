import { useProvider } from "../Provider";
import { WorkflowAction } from "inngest/types";
import { Handle, Node } from "@xyflow/react";
import { Direction } from "../Editor";
import { AddHandle, sourceHandleProps, targetHandleProps } from "./Handles";

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
  const { selectedNode, availableActions } = useProvider();
  const engineAction = availableActions.find(a => a.kind === action.kind);

  const isSelected = selectedNode?.type === "action" && selectedNode.id === node.id;

  return (
    <div
      className={`wf-node wf-action-node ${isSelected ? "wf-node-selected" : ""}`}
    >
        <Handle {...targetHandleProps(direction)} />
        <div className="wf-node-title">
          <div className="wf-node-icon">
            {engineAction?.icon || <DefaultIcon />}
          </div>
          <p>{action.name || engineAction?.name || action.kind}</p>
        </div>

        <p className="wf-node-description">{ action.description || engineAction?.description || "Performs an action" }</p>

        {/* TODO: Add handle with menu options */}
        <AddHandle {...sourceHandleProps(direction)} node={node} action={action} />
    </div>
  );
}

/**
 * BlankNode is a placeholder node, used as a placeholder for users to select
 * an action after hitting the "Add Action" handle.
 * 
 * BlankNodes are temporary;  the state is stored in the provider context.  As
 * soon as a click happens outside of blank node the blank node is deleted.
 */
export const BlankNode = ({ direction }: { direction: Direction }) => {
  return (
    <div className="wf-node wf-blank-node">
      <Handle {...targetHandleProps(direction)} />
    </div>
  );
}

const DefaultIcon = () => (
  <svg width="20" height="20" fill="none" style={{ marginTop: 3 }}>
    <path fill="#9B9B9B" d="M12.905 10.75a3.001 3.001 0 0 1-5.81 0H3.25v-1.5h3.845a3.002 3.002 0 0 1 5.81 0h3.845v1.5h-3.845ZM10 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
  </svg>
)