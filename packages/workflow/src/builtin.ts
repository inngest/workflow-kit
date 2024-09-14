// TODO: Define builtin nodes, like if statements.

import { Type } from "@sinclair/typebox";
import { ActionHandlerArgs, EngineAction } from "./types";
import { apply } from "json-logic-js";

export const builtinActions: Record<string, EngineAction> = {
    "builtin:if": {
        kind: "builtin:if",
        name: "If",
        description: "If / Else logic",
        handler: async ({ workflowAction }: ActionHandlerArgs): Promise<{ result: boolean }> => {

            if (!!!workflowAction.inputs?.condition) {
                // Always true.
                return { result: true };
            }

            const result = apply(workflowAction.inputs.condition);
            return { result };
        },
        inputs: {
            condition: {
                type: Type.Object({}, {
                    title: "Condition",
                    description: "Condition to evaluate",
                    examples: [
                        // NOTE:  Vars aren't necessary, as actions are already interpolated.
                        { "==": [ "!ref($.event.data.likes)", "a" ] },
                        { "and": [
                            { "==": [ "!ref($.event.data.likes)", 1.123 ] }, // NOTE: 1.123 is a float, not a string.  Interpolation handles this.
                            { "==": [ "!ref($.event.data.likes)", "b" ] },
                        ]},
                    ],
                }),
            },
        },
        outputs: {
            result: {
                type: Type.Boolean({
                    title: "Result",
                    description: "Result of the condition",
                }),
            },
        },
    }
}