// A part's inline style the adapter writes on the element itself goes away
// with the part's style, also when the owner leaves `style` out of its spread.
import { flushSync, mount, unmount } from "svelte"
import { expect, test } from "vitest"
import App from "./apps/part-style-left-out-app.svelte"

test("an avatar image loses its hidden style once it loads", () => {
  const target = document.body.appendChild(document.createElement("div"))
  const app = mount(App, { target })
  flushSync()
  const img = target.querySelector("img")!
  expect(img.style.opacity).toBe("0")
  img.dispatchEvent(new Event("load"))
  flushSync()
  expect(img.getAttribute("style") ?? "").toBe("")
  unmount(app)
  target.remove()
})
