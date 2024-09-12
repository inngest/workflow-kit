import React, { useState } from 'react';
import { Type } from '@sinclair/typebox'

import { Editor, Provider, Sidebar } from '../ui/';
import './ui.storybook.css';
import '@xyflow/react/dist/style.css';
import '../ui/ui.css';

// availableActions is of typePublicEngineAction[]
const availableActions = [
  {
    name: "Send an email",
    description: "Sends an email via Resend",
    kind: "send-email",
    icon: "📧",
    inputs: {
      to: {
        type: Type.String({
          title: "To",
          description: "The email address to send the email to",
        }),
      },
      subject: {
        type: Type.String({
          title: "Subject",
          description: "The subject of the email",
        }),
      },
      body: {
        type: Type.String({
          title: "Email content",
          description: "The content of the email",
        }),
        fieldType: "textarea",
      },
    },
  },
  {
    name: "Send a text message",
    description: "Sends a text message via Twilio",
    kind: "send-text-message",
    icon: "📧",
    inputs: {
      to: {
        type: Type.String({
          title: "Phone number",
          description: "The phone number to send the text message to",
        }),
      },
      body: {
        type: Type.String({
          title: "Text message",
          description: "The text message itself",
        }),
      },
    },
  },
]

export const UI = ({ workflow, trigger, direction }) => {
  const [wf, setWorkflow] = useState(workflow);

  return (
    <div className="sb-wrap">
      <Provider
        workflow={wf}
        trigger={trigger}
        availableActions={availableActions}
        onChange={(updated) => {
          setWorkflow(updated)
        }}
      >
        <Editor direction={direction}>
          <Sidebar position="right">
          </Sidebar>
        </Editor>
      </Provider>
    </div>
  );
}

UI.propTypes = {
};

UI.defaultProps = {
};

