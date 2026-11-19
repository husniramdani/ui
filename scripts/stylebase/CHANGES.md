## Changes from UI SDK

This fork changes these files of [UI SDK](https://github.com/vercel-labs/ui) (Apache-2.0). Each change has an issue on the fork with the problem, before and after evidence, and the fix.

Based on UI SDK 0.1.0-beta.10. Changes dropped because upstream released them or no longer needs them:

- In 0.1.0-beta.7: the combobox caret jumping to the end ([#1](https://github.com/husniramdani/ui/issues/1), upstream [#663](https://github.com/vercel-labs/ui/pull/663)) and a combobox's label click opening the list ([#9](https://github.com/husniramdani/ui/issues/9), upstream [#684](https://github.com/vercel-labs/ui/pull/684)).
- In 0.1.0-beta.10: the dialog content option `inline` ([#7](https://github.com/husniramdani/ui/issues/7), upstream [#827](https://github.com/vercel-labs/ui/pull/827)), a Svelte menu that never opened again ([#13](https://github.com/husniramdani/ui/issues/13), upstream [#779](https://github.com/vercel-labs/ui/pull/779)), the select option `virtualFocus` ([#15](https://github.com/husniramdani/ui/issues/15), upstream [#829](https://github.com/vercel-labs/ui/pull/829)), a controlled OTP input's caret and selection ([#17](https://github.com/husniramdani/ui/issues/17), upstream [#789](https://github.com/vercel-labs/ui/pull/789)), the listbox option `virtualFocus` ([#20](https://github.com/husniramdani/ui/issues/20), upstream [#830](https://github.com/vercel-labs/ui/pull/830)), an exit animation wiping the owner's `inert` ([#23](https://github.com/husniramdani/ui/issues/23), upstream [#807](https://github.com/vercel-labs/ui/pull/807)) and a Svelte part's inline style staying ([#26](https://github.com/husniramdani/ui/issues/26), upstream [#810](https://github.com/vercel-labs/ui/pull/810)).
- A popup placed again from between two layout steps ([#11](https://github.com/husniramdani/ui/issues/11), upstream [vercel-labs/ui#700](https://github.com/vercel-labs/ui/issues/700)): since 0.1.0-beta.8 popups are placed with CSS anchor positioning or on whole device pixels, so a popup placed again lands where a fresh one does.

What this fork still changes:

- **A combobox's list was named by the text in its input when its `<label>` has no id** ([#2](https://github.com/husniramdani/ui/issues/2), upstream [vercel-labs/ui#572](https://github.com/vercel-labs/ui/issues/572)). Upstream names the list as its field is named, but can only point at a label with an id; the list now takes the text of one without. Changed: `packages/core/src/foundation/lists/field-name.ts`.
- **New combobox option `highlightSelected`**: opening the list highlights the selected item, and unlike `autoHighlight: "selected"` it leaves typing alone ([#5](https://github.com/husniramdani/ui/issues/5)). Changed: `packages/core/src/components/combobox/combobox.ts`, `packages/core/src/components/combobox/combobox-api.ts`, `packages/svelte/src/combobox/combobox.svelte`, `packages/vue/src/combobox.ts`, and each framework's combobox docs page.
- **With listbox `virtualFocus`, a press took focus back from the press's own handlers**, like a menu closing back to its trigger ([#20](https://github.com/husniramdani/ui/issues/20)). Changed: `packages/core/src/components/listbox/listbox-root-parts.ts`.
- **Stopping an exit that had already ended put back the `inert` it started with**, undoing what the owner wrote since ([#23](https://github.com/husniramdani/ui/issues/23)). Changed: `packages/core/src/foundation/motion/presence.ts`.

The React package's own code is unchanged; it ships with the changed core.
