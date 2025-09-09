> [!NOTE]
> Workflow kit is a reference implementation of how to build user-defined workflows with Inngest. We recommend using this repo as a reference when designing your own implementation.

<p align="center">

![Workflow Kit by Inngest](https://github.com/inngest/workflow-kit/blob/main/.github/assets/workflow-kit.jpg?raw=true)

</p>

<p align="center">
    <a href="https://www.inngest.com/docs/reference/workflow-kit?ref=github-workflow-kit-readme">Documentation</a>
    <span>&nbsp;·&nbsp;</span>
    <a href="https://www.inngest.com/blog?ref=github-workflow-kit-readme">Blog</a>
    <span>&nbsp;·&nbsp;</span>
    <a href="https://www.inngest.com/discord">Community</a>
</p>

# Workflow kit

**Workflow kit** is a set of patterns that enable you to build user-defined workflows with Inngest by providing workflow actions to the **[Workflow Engine](https://www.inngest.com/docs/reference/workflow-kit/engine?ref=github-workflow-kit-readme)** while using the **[pre-built React components](https://www.inngest.com/docs/reference/workflow-kit/components-api?ref=github-workflow-kit-readme)** to build your Workflow Editor UI.

![Workflow kit UI demo](https://github.com/inngest/workflow-kit/blob/main/.github/assets/workflow-demo.gif?raw=true)

## Installation

Workflow kit requires the [Inngest TypeScript SDK](https://github.com/inngest/inngest-js) as a dependency. You can install both via `npm` or similar:

```shell {{ title: "npm" }}
npm install @inngest/workflow-kit inngest
```

## Documentation

The full Workflow kit documentation is available [here](https://www.inngest.com/docs/reference/workflow-kit). You can also jump to specific guides and references:

- [Creating workflow actions](https://www.inngest.com/docs/reference/workflow-kit/actions?ref=github-workflow-kit-readme)
- [Using the workflow engine](https://www.inngest.com/docs/reference/workflow-kit/engine?ref=github-workflow-kit-readme)
- [Workflow instance format](https://www.inngest.com/docs/reference/workflow-kit/workflow-instance?ref=github-workflow-kit-readme)
- [Components API (React)](https://www.inngest.com/docs/reference/workflow-kit/components-api?ref=github-workflow-kit-readme)

## Examples

See Workflow kit in action in fully functioning example projects:

- [Next.js Blog CMS](/examples/nextjs-blog-cms#readme) - A ready-to-deploy Next.js demo using the Workflow Kit, Supabase, and OpenAI to power some AI content workflows.

## License

[Apache 2.0](/packages/workflow/LICENSE.md)
