# Smart Water Platform Documentation Rules

## Before editing

1. Read `CONTRIBUTING.md`, `STYLE_GUIDE.md`, and the relevant template in `templates/`.
2. Check the project coordination board before a broad content or publishing change.
3. Treat a document's front matter `id` as permanent. Moving a file must not change its ID.

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
