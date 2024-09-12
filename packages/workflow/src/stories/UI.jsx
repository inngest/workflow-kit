import React from 'react';

import { Editor, Provider, Sidebar } from '../ui/';
import './ui.storybook.css';
import '@xyflow/react/dist/style.css';
import '../ui/ui.css';

export const UI = ({ workflow, trigger, direction }) => (
  <div className="sb-wrap">
    <Provider workflow={workflow} trigger={trigger} onChange={() => {}}>
      <Editor
        onTriggerClick={() => {
          console.log('trigger clicked');
        }}
        direction={direction}
      >
        <Sidebar position="right">
        </Sidebar>
      </Editor>
    </Provider>
  </div>
);

UI.propTypes = {
};

UI.defaultProps = {
};

