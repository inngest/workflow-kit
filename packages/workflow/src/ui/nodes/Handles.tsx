import { useState } from "react";
import { Handle, HandleProps, Position } from "@xyflow/react";
import * as Popover from '@radix-ui/react-popover';
import { Node } from "@xyflow/react";

import { useProvider } from "../Provider";
import { Direction } from "../Editor";
import { PublicEngineEdge, WorkflowAction } from "../../types";

export type BlankNodeType = Node<{
  parent: Node,

  /**
   * Edge stores the edge information if this was a predefined edge from eg. an
   * if block.
   */
  edge?: PublicEngineEdge
}>;

export const NewBlankNode = (parent: Node, edge?: PublicEngineEdge): BlankNodeType => ({
  id: '$blank',
  type: 'blank',
  position: { x: 0, y: 0 },
  data: {
    parent: parent,
    edge: edge
  }
})

export const AddHandle = (props: HandleProps & { node: Node, action?: WorkflowAction }) => {
  const { node, action, ...rest } = props;
  const { setBlankNode, setSelectedNode, availableActions } = useProvider();
  const [menuOpen, setMenuOpen] = useState(false);

  // We want to find out whether the engine action's definition has any built-in edges,
  // or if we disable the 'Add new node' handle.
  const engineAction = availableActions.find((ea) => ea.kind === action?.kind);

  if (engineAction?.edges?.allowAdd === false && engineAction?.edges?.length === 0) {
    return null;
  }

  // This is the default handler for adding a new blank node.
  const addNode = (edge?: PublicEngineEdge): BlankNodeType => {
    const blankNode = NewBlankNode(node, edge);
    setBlankNode(blankNode);
    setSelectedNode(blankNode);
    return blankNode;
  }

  const renderHandle = (onClick?: () => void) => (
    <Handle {...rest} className="wf-add-handle" onClick={onClick}>
      <div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Handle>
  );

  const edges = engineAction?.edges?.edges || [];

  if (!edges.length) {
   return renderHandle(() => addNode());
  }

  return (
    <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <Popover.Trigger asChild>
        {
          // This handler has no onClick, as we instead handle everything within the popover
          renderHandle()
        }
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content>
          <div className="wf-add-handle-menu">
            {edges.map((edge) => (
              <div
                key={edge.name}
                className="wf-add-handle-menu-item"
                onClick={() => {
                  const blankNode = addNode(edge);
                  setMenuOpen(false);
                  // This is a hack to auto-select the blank node.  We need to fix this shit.
                  window?.setTimeout(() => { setSelectedNode(blankNode); }, 0);
                }}
              >
                <p className="wf-add-handle-menu-label">{edge.name}</p>
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const targetHandleProps = (direction: Direction): HandleProps => {
  return {
    type: "target",
    position: direction === "down" ? Position.Top : Position.Left,
    className: "wf-target-handle",
  }
}

export const sourceHandleProps = (direction: Direction): HandleProps => {
  return {
    type: "source",
    position: direction === "down" ? Position.Bottom : Position.Right,
  }
}