import React, { ReactNode } from "react";

export function SidebarTriggerForm({
  children,
  trigger,
}: {
  children: ReactNode;
  trigger: any;
}) {
  return (
    <>
      <div className="wf-sidebar-action">
        <p className="wf-sidebar-action-name">{trigger.event?.name}</p>
        {trigger.event?.description && (
          <p className="wf-sidebar-action-description">
            {trigger.event.description}
          </p>
        )}
      </div>
      <div className="wf-sidebar-form">
        <div className="wf-sidebar-configure" />
        {children}
      </div>
    </>
  );
}
