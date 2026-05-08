# UI Coding Standards

## Component Library

**All UI components must use shadcn/ui exclusively.**

- Do not create custom UI components. Every button, input, card, dialog, table, form element, etc. must come from the shadcn/ui component library.
- If a shadcn/ui component does not exist for a specific need, compose existing shadcn/ui primitives together rather than building a custom component from scratch.
- Install new shadcn/ui components via the CLI: `npx shadcn@latest add <component-name>`
- Components are installed into `src/components/ui/` and must not be modified except to apply project-specific default variants if needed.

## Date Formatting

All dates must be formatted using `date-fns`. Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting method.

### Required Format

Dates must use ordinal day suffixes with abbreviated month and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use the `do MMM yyyy` format token with `date-fns/format`:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```

The `do` token produces the ordinal day (1st, 2nd, 3rd, 4th, etc.), `MMM` produces the abbreviated month name, and `yyyy` produces the four-digit year.
