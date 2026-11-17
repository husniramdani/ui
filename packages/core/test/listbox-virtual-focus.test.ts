// @vitest-environment jsdom
// With `virtualFocus`, focus stays on the listbox, which points at the
// highlighted option with `aria-activedescendant`.
import { afterEach, expect, test } from "vitest"
import { listbox } from "../src/components/listbox/listbox-root"
import { mount } from "../src/testing/mount"

const mounts: { unmount: () => void }[] = []
afterEach(() => {
  mounts.splice(0).forEach((mounted) => mounted.unmount())
  document.body.replaceChildren()
})

const markup = `<root aria-label="Letter">
  <item value="a">Alpha</item><item value="b" disabled>Beta</item><item value="c">Gamma</item><item value="d">Delta</item>
</root>`

function focused(options: Record<string, unknown> = {}) {
  const view = mount(listbox, { virtualFocus: true, ...options }, markup)
  mounts.push(view)
  const root = view.part("root")!
  root.focus()
  return {
    view,
    root,
    pointsAt: () => {
      const id = root.getAttribute("aria-activedescendant")
      return id ? document.getElementById(id)?.textContent : null
    },
  }
}

test("the listbox is the tab stop and keeps focus while keys move the highlight", async () => {
  const { view, root, pointsAt } = focused({
    defaultValue: "c",
    activation: "manual",
    loop: false,
  })
  await view.settle()
  expect(root.getAttribute("tabindex")).toBe("0")
  expect(view.part("item", "a")!.hasAttribute("tabindex")).toBe(false)
  expect(pointsAt()).toBe("Gamma")
  await view.keys("ArrowUp")
  // Beta is disabled, so the highlight skips it.
  expect(document.activeElement).toBe(root)
  expect(pointsAt()).toBe("Alpha")
  await view.keys("End")
  expect(pointsAt()).toBe("Delta")
  await view.keys("ArrowDown")
  expect(pointsAt()).toBe("Delta")
  await view.keys("Home")
  expect(pointsAt()).toBe("Alpha")
  await view.type("d")
  expect(pointsAt()).toBe("Delta")
  expect(document.activeElement).toBe(root)
  expect(view.api.getValue()).toBe("c")
})

test("Enter chooses the highlighted option, with focus still on the listbox", async () => {
  const { view, root } = focused({ activation: "manual" })
  await view.settle()
  await view.keys("End")
  await view.keys("Enter")
  expect(view.api.getValue()).toBe("d")
  expect(document.activeElement).toBe(root)
})

test("the pointer highlights an option, and a press chooses it without moving focus", async () => {
  const { view, root, pointsAt } = focused({ activation: "manual" })
  await view.settle()
  const delta = view.part("item", "d")!
  delta.dispatchEvent(
    new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse" })
  )
  expect(pointsAt()).toBe("Delta")
  await view.keys("ArrowUp")
  expect(pointsAt()).toBe("Gamma")
  view.part("item", "a")!.click()
  await view.settle()
  expect(view.api.getValue()).toBe("a")
  expect(document.activeElement).toBe(root)
  expect(pointsAt()).toBe("Alpha")
})

test("leaving the listbox drops the highlight", async () => {
  const { view, root } = focused()
  await view.settle()
  const after = document.body.appendChild(document.createElement("button"))
  after.focus()
  await view.settle()
  expect(root.hasAttribute("aria-activedescendant")).toBe(false)
})

test("without it, focus moves onto the options", async () => {
  const { view, root } = focused({ virtualFocus: false, defaultValue: "a" })
  await view.settle()
  expect(document.activeElement).toBe(view.part("item", "a"))
  expect(root.hasAttribute("aria-activedescendant")).toBe(false)
})

test("a press leaves focus where the press's own handlers put it", async () => {
  const { view } = focused({ activation: "manual" })
  await view.settle()
  const elsewhere = document.body.appendChild(document.createElement("button"))
  const move = () => elsewhere.focus()
  document.addEventListener("click", move, true)
  view.part("item", "c")!.click()
  document.removeEventListener("click", move, true)
  await view.settle()
  expect(view.api.getValue()).toBe("c")
  expect(document.activeElement).toBe(elsewhere)
})
