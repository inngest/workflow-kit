import React from 'react';

import { Editor } from '../ui/ui';
import './ui.css';
import '@xyflow/react/dist/style.css';
import '../ui/ui.css';

export const UI = ({ workflow, event, direction }) => (
  <div className="sb-wrap">
    <Editor
      workflow={workflow}
      event={event}
      onTriggerClick={() => {
        console.log('trigger clicked');
      }}
      direction={direction}
    />
  </div>
);

UI.propTypes = {
};

UI.defaultProps = {
  direction: "down",
  workflow: {
    "actions": [
      {
        "id": "1",
        "kind": "send-email",
        "name": "Send Email",
        "description": "Send an email to the user",
        "inputs": {
          "to": "!ref($.event.data.email)",
          "subject": "Welcome to the platform",
          "body": "Welcome to the platform"
        }
      }
    ],
    "edges": [
      {
        "from": "$source",
        "to": "1"
      }
    ]
  },
};

