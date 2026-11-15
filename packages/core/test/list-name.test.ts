// @vitest-environment jsdom
// A combobox's or autocomplete's list is named as its field is, never by the
// field itself: an input that labels another element names it by its text.
import { afterEach, expect, test } from "vitest"
import { autocomplete } from "../src/components/autocomplete/autocomplete"
import { combobox } from "../src/components/combobox/combobox"
import { mount } from "../src/testing"

const mounts: { unmount: () => void }[] = []
afterEach(() => {
  mounts.splice(0).forEach((mounted) => mounted.unmount())
  document.body.replaceChildren()
})

const settle = () => new Promise((resolve) => setTimeout(resolve, 20))

async function listName(
  primitive: typeof combobox | typeof autocomplete,
  field: string,
  label?: (input: HTMLElement) => void
) {
  const mounted = mount(
    primitive as typeof combobox,
    { items: ["Next.js", "Astro"], defaultValue: "Astro", defaultOpen: true },
    `<root>${field}<content><list></list></content></root>`
  )
  mounts.push(mounted)
  label?.(mounted.part("input") as HTMLElement)
  await settle()
  const list = mounted.part("list") as HTMLElement
  const labelPart = mounted.part("label") as HTMLElement | undefined
  return {
    labelledBy: list.getAttribute("aria-labelledby"),
    label: list.getAttribute("aria-label"),
    namedByLabelPart:
      !!labelPart && list.getAttribute("aria-labelledby") === labelPart.id,
  }
}

test("a combobox named by aria-label gives its list that name", async () => {
  expect(
    await listName(combobox, `<input aria-label="Framework">`)
  ).toMatchObject({ labelledBy: null, label: "Framework" })
})

test("a combobox named by another element names its list by that element", async () => {
  expect(
    await listName(
      combobox,
      `<span id="framework-name">Framework</span><input aria-labelledby="framework-name">`
    )
  ).toMatchObject({ labelledBy: "framework-name", label: null })
})

test("a combobox named by a label element gives its list the label's text", async () => {
  expect(
    await listName(combobox, "<input>", (input) => {
      const label = document.createElement("label")
      label.htmlFor = input.id
      label.textContent = "Framework"
      document.body.prepend(label)
    })
  ).toMatchObject({ labelledBy: null, label: "Framework" })
})

test("the label part names the list", async () => {
  expect(
    await listName(combobox, "<label>Framework</label><input>")
  ).toMatchObject({ namedByLabelPart: true, label: null })
})

test("an autocomplete named by aria-label gives its list that name", async () => {
  expect(
    await listName(autocomplete, `<input aria-label="Framework">`)
  ).toMatchObject({ labelledBy: null, label: "Framework" })
})
