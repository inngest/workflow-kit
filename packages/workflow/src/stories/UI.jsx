import React from 'react';

import { Editor } from '../ui/ui';
import './ui.css';
import '@xyflow/react/dist/style.css';

export const UI = ({ workflow, event }) => (
  <div className="sb-wrap">
    <Editor workflow={workflow} event={event} />
  </div>
);

UI.propTypes = {
};

UI.defaultProps = {
};

