# CLAUDE.md

Guidance for working in this repository. Read this before making any change.

## What this is

A **GOV.UK Prototype Kit** prototype of the re/ex (reprocessing / export) operator process for recording reprocessed or exported packaging waste. It is a throwaway prototype for testing ideas with users — **not** production code and **not** a real service.

- Framework: [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk/docs) `13.20.0`
- Design system: [GOV.UK Frontend](https://design-system.service.gov.uk/) `6.1.0`
- Also available: [MOJ Frontend](https://design-patterns.service.justice.gov.uk/) (`@ministryofjustice/frontend` `9.0.0`)
- Templating: Nunjucks
- Run locally: `npm run dev`, then open `localhost:3000`

## Non-negotiable rules

These rules override any default instinct to "improve" or "tidy" the prototype. Do not deviate without an explicit prompt from the user.

### 1. Only use official GDS / MOJ components

Build **exclusively** with components and patterns from:

- **GOV.UK Design System** — https://design-system.service.gov.uk/components/
- **MOJ Design System patterns** — https://design-patterns.service.justice.gov.uk/

Prefer the GOV.UK Design System first. Use MOJ Frontend only where GOV.UK does not provide the component/pattern needed. Always use the Nunjucks macros these systems provide (e.g. `govukButton`, `govukSummaryList`, `govukTaskList`, `mojXxx`) rather than hand-writing HTML that mimics them.

### 2. Never build new components

Do **not** create new/bespoke components, macros, or custom UI outside of the GOV.UK / MOJ design systems **unless the user explicitly asks you to**. If a screen seems to need something that doesn't exist in either design system, stop and ask — do not invent it.

### 3. Never change existing design

Do not restyle, re-layout, refactor, or "improve" existing pages, components, SCSS, or markup. Leave working design as it is. Only touch what the user has specifically asked you to change.

### 4. Never change content

Do not edit, reword, correct, or rewrite any existing copy (headings, labels, hint text, body text, button text, etc.) — even to fix typos or grammar — unless explicitly asked.

### 5. New content uses placeholders

When a new page or element needs content that hasn't been provided, insert a literal placeholder rather than writing your own copy:

```
[add content here]
```

Use this for any text you would otherwise have to invent.

## Project architecture — keep it consistent

Match the existing structure and conventions exactly. Do not restructure, rename, or "modernise" the layout.

### Directory layout

```
app/
  config.json            # Service name
  routes.js              # Top-level router; delegates to per-prototype _routes.js
  filters.js             # Custom Nunjucks filters (date, push, currency, cleanArray, etc.)
  data/
    session-data-defaults.js  # Default session data
    countries.json
  assets/
    javascripts/         # application.js + vendored libs (e.g. accessible-autocomplete)
    sass/
      application.scss   # Imports component partials
      settings.scss
      components/        # _cards.scss, _summary-list.scss, _page-header.scss, etc.
  views/
    layouts/             # main.html (extends govuk-branded), email.html
    index.html
    <prototype>/         # e.g. reaccredit, account
      index.html
      v<n>/              # Versioned iterations: v1, v2, v3 …
        _routes.js       # Per-version routes
        <pages>.html
        <feature>/       # Grouped flows, e.g. add-site/, apply/
```

### Conventions to follow

- **Prototype + version routing.** URLs follow `/:prototype/v:version/...` (see `app/routes.js`). Each version folder has its own `_routes.js` that sets `res.locals`, handles POSTs, and does redirects. Add new page routing to the relevant version's `_routes.js`, above the `module.exports` line.
- **New iterations = new version folder.** When iterating on a flow, create a new `v<n>/` folder rather than editing an earlier version in place (unless told otherwise). This preserves prior versions for comparison.
- **Views extend `layouts/main.html`.** Pages use its blocks: `content`, `questions`, `buttons`, `backLink`, `pageScripts`. Question pages can just fill the `questions` block; the layout provides the `<form method="post">` wrapper and default "Save and continue" button.
- **Set `title` via `{% set title = '…' %}`** — the layout wires it into `pageTitle`.
- **Forms post to themselves;** flow/redirect logic lives in `_routes.js`.
- **Session data** is read/written via `req.session.data[...]` and defaulted in `app/data/session-data-defaults.js`.
- **SCSS:** custom app styles are namespaced `app-` (e.g. `.app-page-header`). New partials go in `app/assets/sass/components/` and are imported from `application.scss`. Only add styling when the user asks; prefer design-system classes over custom CSS.
- **Custom filters** live in `app/filters.js`. Reuse existing ones (`date`, `currency`, `push`, `cleanArray`, `isArray`, `isObject`) rather than adding new logic in templates.

## When in doubt

Ask. Especially before: adding a new component, changing any existing design or content, or altering the project structure. The safe default is to do exactly what was asked and nothing more.
