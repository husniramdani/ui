// Modified by Husni Ramdani in the fork husniramdani/ui, 2026: names a list by a field's label that has no id (#2).
// Fork of UI SDK (vercel-labs/ui), Apache-2.0. See scripts/stylebase/CHANGES.md.

import { later } from "../kernel/bound-keys"
import type { Store } from "../kernel/store"

// How the field is named when no label part names it. A list labelled by the
// input itself would be named by the text typed in it.
type FieldName = { labelledBy: string } | { label: string } | null

function fieldNameOf(el: HTMLElement, id: string) {
  const labelledBy = el.getAttribute("aria-labelledby")
  if (labelledBy && labelledBy !== `${id}-label`) {
    return { labelledBy }
  }
  const labels = [...((el as HTMLInputElement).labels ?? [])]
  if (labels.length && labels.every((label) => label.id)) {
    return { labelledBy: labels.map((label) => label.id).join(" ") }
  }
  const label = el.getAttribute("aria-label")
  if (label) {
    return { label }
  }
  // A `<label>` without an id can't be pointed at, so the list takes its text.
  const text = labels
    .map((label) => label.textContent?.trim())
    .filter(Boolean)
    .join(" ")
  return text ? { label: text } : null
}

// A microtask later, like the flags parts set when they bind: in Vue a list
// hydrating after a synchronous write keeps the server's attributes.
function bindFieldName(
  el: HTMLElement,
  store: Store<{ fieldName: FieldName }>,
  id: string
) {
  later(store, (draft) => {
    const next = fieldNameOf(el, id)
    if (JSON.stringify(next) !== JSON.stringify(store.get().fieldName)) {
      draft.fieldName = next
    }
  })
}

// The label names the list, or else what names the field.
function listName(
  state: { labeled?: boolean; fieldName: FieldName },
  id: string
) {
  const named = state.labeled ? null : state.fieldName
  return {
    "aria-labelledby": state.labeled
      ? `${id}-label`
      : named && "label" in named
        ? undefined
        : (named?.labelledBy ?? `${id}-input`),
    "aria-label": named && "label" in named ? named.label : undefined,
  }
}

export { bindFieldName, type FieldName, listName }
