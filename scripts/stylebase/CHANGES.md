## Changes from UI SDK

This fork changes these files of [UI SDK](https://github.com/vercel-labs/ui) (Apache-2.0). Each change has an issue on the fork with the problem, before and after evidence, and the fix.

- **Typing inside a combobox's chosen label kept moving the caret to the end** ([#1](https://github.com/husniramdani/ui/issues/1)). Changed: `packages/core/src/components/combobox/combobox-parts.ts`, `packages/core/src/foundation/kernel/live.ts`.
- **A combobox's list was named by the text in its input, not by its label** ([#2](https://github.com/husniramdani/ui/issues/2), upstream [vercel-labs/ui#572](https://github.com/vercel-labs/ui/issues/572)). Changed: `packages/core/src/foundation/lists/listbox-popup.ts`.
- **New combobox option `highlightSelected`**: opening the list highlights the selected item ([#5](https://github.com/husniramdani/ui/issues/5)). Changed: `packages/core/src/components/combobox/combobox.ts`, `packages/core/src/components/combobox/combobox-api.ts`, `packages/svelte/src/combobox/combobox.svelte`, `packages/vue/src/combobox.ts`, and each framework's combobox docs page (`docs/components/combobox.md` in the React, Vue and Svelte packages).

The React package's own code is unchanged; it ships with the changed core.
