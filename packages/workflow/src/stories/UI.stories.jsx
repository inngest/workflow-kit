import React from 'react';
import { UI } from './UI';

export default {
  title: 'Workflow Editor',
  component: UI,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    workflow: undefined,
    trigger: undefined,
    direction: "right" | "down",
  },
};

export const Blank = {
  args: {
    workflow: undefined,
    trigger: undefined,
    direction: "right",
  }
};

export const EventOnly = {
  args: {
    workflow: undefined,
    trigger: {
      event: {
        name: "shopify/order.created",
        data: {
          order: 123,
        },
      }
    },
  }
};
