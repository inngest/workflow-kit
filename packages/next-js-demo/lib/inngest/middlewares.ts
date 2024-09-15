import { InngestMiddleware } from "inngest";
import OpenAI from "openai";

export const openaiMiddleware = new InngestMiddleware({
  name: "OpenAI Middleware",
  init() {
    const openai = new OpenAI({
      apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
    });

    return {
      onFunctionRun() {
        return {
          transformInput() {
            return {
              // Anything passed via `ctx` will be merged with the function's arguments
              ctx: {
                openai,
              },
            };
          },
        };
      },
    };
  },
});
