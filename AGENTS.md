# Smart Water Platform Documentation Rules

## Before editing

1. Read `CONTRIBUTING.md`, `STYLE_GUIDE.md`, and the relevant template in `templates/`.
2. Check the project coordination board before a broad content or publishing change.
3. Treat a document's front matter `id` as permanent. Moving a file must not change its ID.

## Multi-model authoring and review

Use capability roles rather than assuming one model must plan, write, and approve an entire documentation batch:

- **Coordinator/reviewer**: the strongest available reasoning model, currently Sol. It claims the batch, selects document backlog items, prepares task cards, assigns non-overlapping files, and performs the final factual and editorial review.
- **Bounded author**: an efficient execution model, currently Luna. It writes one or more explicitly scoped documents from a complete task card.
- **Planner-author**: a capable intermediate model, such as Gemini 3.7 Flash, may plan and write a bounded batch without a separate Sol planning pass. It still claims scopes, follows the same handoff contract, and cannot approve its own published content.
- Other providers or models may fill any role when their capability is comparable. Record the role in the board actor or handoff; do not make repository rules depend on a vendor-specific API.

Every delegated document task must have a compact task card with:

```text
task_id:
document_ids:
audience_and_purpose:
allowed_files:
authoritative_sources:
required_sections:
required_assets:
acceptance_criteria:
explicit_exclusions:
version_change:
validation_commands:
```

Authors must:

- read `CONTRIBUTING.md`, `STYLE_GUIDE.md`, the relevant template, and only the source material listed in the task card;
- claim the exact document IDs and paths on the shared board before editing;
- never infer product behaviour, performance, permissions, API fields, or acceptance results that are absent from an authoritative source;
- keep changes inside the assigned files unless the coordinator approves a scope update;
- hand back changed files, sources used, validations run, unresolved questions, and proposed `catalog/document-backlog.yml` status changes;
- leave commit, merge, snapshot publication, and task closure to the coordinator unless explicitly assigned.

The independent reviewer checks:

1. factual claims against the listed sources;
2. suitability for the intended non-developer or technical audience;
3. terminology, structure, examples, diagrams, links, and asset attribution;
4. front matter, stable IDs, `document_version`, backlog status, and release compatibility;
5. all required validation and build results.

Review results are:

- `approved`: the document can enter the normal PR/CI flow;
- `revise`: return a short prioritized correction list with exact file or section references and expected outcomes;
- `blocked`: identify the missing source, product decision, or dependency.

Send `revise` work back to the same author when practical so context is reused. Repeat until approved or blocked. A writer may not provide the final approval for its own meaningful published content, including when a planner-author performed both task decomposition and drafting. Typographical-only edits may use normal lightweight review.

## Authoring

- Use the single public documentation source in this repository. Do not maintain a parallel internal copy.
- Published text is versioned: changing meaningful content requires a `document_version` increase.
- Put unfinished writing in `drafts/`; only `docs/` participates in a release snapshot.
- Keep product terms consistent with `catalog/terminology.yml`.
- Record sources, licenses, and alternative text for every image in `catalog/assets.yml`.
- Avoid credentials, internal addresses, personal data, screenshots of production data, and unverified claims.

## Product changes

Feature, API, permission, workflow, algorithm, deployment, or user-behaviour changes require documentation impact in the same product change. The owner must either submit a documentation PR or explicitly state `documentation impact: none` and why.

## Release

- `main` is collaborative source, not an automatic public release.
- Only the manual snapshot workflow creates a public Pages release and a delivery bundle.
- Snapshot tags are immutable. Never force-push or move one.
- Only an approved task may be merged or included in a manual snapshot. The coordinator/reviewer records the final board update and release decision.
