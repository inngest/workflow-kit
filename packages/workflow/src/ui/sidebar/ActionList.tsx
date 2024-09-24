import { PublicEngineAction } from "../../types";
import { useProvider } from "../Provider";

export const ActionList = ({ actions }: { actions: PublicEngineAction[] }) => {
  const { workflow, onChange, blankNode, setBlankNode, appendAction } = useProvider();

  return (
    <div>
      <div className="wf-sidebar-content">
        Select an action
      </div>
      <div className="wf-sidebar-content">
        {actions.map((action) => (
          <ActionListItem key={action.kind} action={action} onClick={() => {
            if (blankNode === undefined) {
              return;
            }
            appendAction(action, blankNode?.data.parent.id, blankNode?.data.edge);
          }} />
        ))}
      </div>
    </div>
  )
}

export const ActionListItem = ({ action, onClick }: { action: PublicEngineAction, onClick: () => void }) => {
  return (
    <div className="wf-sidebar-action-list-item" onClick={onClick}>
      {action.name}
    </div>
  )
}