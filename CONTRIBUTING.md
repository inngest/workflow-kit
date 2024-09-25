# Contributing

## Releasing

To release to production, we use
[Changesets](https://github.com/changesets/changesets). This means that
releasing and changelog generation is all managed through PRs, where a bot will
guide you through the process of adding release notes to PRs.

When you create a PR, the <kbd>changeset-bot</kbd> will add a comment prompting you
to add changesets if this PR requires it.

![image](https://github.com/user-attachments/assets/91a980f0-d4af-4bad-bb29-732e2be5ff87)

Clicking the bottom link will take you to the creation of a new changeset on GitHub. It'll look something like this:

```
---
"@inngest/workflow-kit": patch
---

An important change
```

Here we're stating that this PR will change the patch version with the release note `An important change`.

Each changeset you create will constitute a single user-facing note in
the changelog and GitHub Release notes, so think about how best to introduce a
user to a new feature, fix, or migration when adding a changeset to a PR.

> [!NOTE]
> Not all changes need a changeset! Since changesets are focused on releases and
> changelogs, changes to a package that don't require these won't need a
> changeset. For example, changing GitHub configuration files or non-user-facing
> markdown.

As PRs are merged into main, a new PR (usually called **Release @latest**) is
created that rolls up all release notes since the last release, allowing you
bundle changes together. Once you're happy with the release, merge this new PR
and the bot will release the package to npm for you and tag the release commit
(which changes version numbers and modifies the changelog) with a tag like
`@inngest/workflow-kit@1.2.3`.
