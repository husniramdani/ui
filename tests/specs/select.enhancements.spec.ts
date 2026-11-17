import type { Page } from "@playwright/test"
import { expect, lastAction, test } from "../fixtures"

// Behavior past the WAI-ARIA pattern, tagged `@enhancement`.

const trigger = (page: Page) => page.getByRole("combobox", { name: "Fruit" })
const listbox = (page: Page) => page.getByRole("listbox")
const option = (page: Page, name: string) =>
  page.getByRole("option", { name, exact: true })

test.describe("enhancements", { tag: "@enhancement" }, () => {
  // A styled layer wraps the content part in a component of its own, so the
  // select can't find it in the markup; the part tells the select it's there.
  test("a data select whose content part is wrapped in a component renders one list", async ({
    page,
    open,
  }) => {
    await open("select", { wrapped: "" })
    await trigger(page).click()
    await expect(option(page, "Banana")).toBeVisible()
    await expect(listbox(page)).toHaveCount(1)
    await expect(page.locator(".list-popup")).toHaveCount(1)
  })

  test("the list is named by the select's label", async ({ page, open }) => {
    await open("select")
    await trigger(page).click()
    await expect(page.getByRole("listbox", { name: "Fruit" })).toBeVisible()
  })

  test("a clear button selects nothing and keeps focus on the select", async ({
    page,
    open,
  }) => {
    await open("select", { value: "banana" })
    await page.getByRole("button", { name: "Clear" }).click()
    await expect(trigger(page)).toContainText("Pick a fruit")
    await expect(trigger(page)).toBeFocused()
    expect(await lastAction(page)).toBe("value:null")
    // Nothing to clear, so it's gone.
    await expect(page.getByRole("button", { name: "Clear" })).toHaveCount(0)
  })

  test("Alt+ArrowUp chooses the focused item and closes, as the APG asks", async ({
    page,
    open,
  }) => {
    await open("select")
    await trigger(page).focus()
    await page.keyboard.press("Enter")
    await page.keyboard.press("ArrowDown")
    await expect(option(page, "Banana")).toBeFocused()
    await page.keyboard.press("Alt+ArrowUp")
    await expect(listbox(page)).toBeHidden()
    await expect(trigger(page)).toContainText("Banana")
  })

  test("the content says whether the keyboard or a pointer is in use, for styling the highlight", async ({
    page,
    open,
  }) => {
    await open("select")
    await trigger(page).focus()
    await page.keyboard.press("Enter")
    const content = page.locator('[data-slot="select-content"]')
    await expect(content).toHaveAttribute("data-modality", "keyboard")
    const box = (await option(page, "Cherry").boundingBox())!
    await page.mouse.move(box.x + 5, box.y + 5)
    await page.mouse.move(box.x + 20, box.y + 8)
    await expect(content).toHaveAttribute("data-modality", "pointer")
    await page.keyboard.press("ArrowDown")
    await expect(content).toHaveAttribute("data-modality", "keyboard")
  })

  test("a form reset returns the select to its default value", async ({
    page,
    open,
  }) => {
    await open("select", { value: "banana" })
    await trigger(page).focus()
    await page.keyboard.press("Enter")
    await page.keyboard.press("End")
    await page.keyboard.press("Enter")
    await expect(trigger(page)).toContainText("Orange")
    await page.getByRole("button", { name: "Reset" }).click()
    await expect(trigger(page)).toContainText("Banana")
  })

  test("typing on the closed trigger selects items before the list has ever been in the page", async ({
    page,
    open,
    tab,
  }) => {
    await open("select")
    await page.getByRole("button", { name: "Before" }).focus()
    // Tab and type at once, without waiting for anything to render.
    await tab()
    await page.keyboard.type("l")
    await expect(trigger(page)).toContainText("Lemon")
  })
})

test.describe("focus on the trigger", { tag: "@enhancement" }, () => {
  test("with virtualFocus, keys move the highlight while focus stays on the trigger, which points at it", async ({
    page,
    open,
  }) => {
    await open("select", { "virtual-focus": "", value: "cherry" })
    await trigger(page).focus()
    await page.keyboard.press("ArrowDown")
    await expect(listbox(page)).toBeVisible()
    await expect(trigger(page)).toBeFocused()
    // The label of the option the trigger points at.
    const pointsAt = () =>
      trigger(page).evaluate((el) => {
        const id = el.getAttribute("aria-activedescendant")
        const item = id && el.ownerDocument.getElementById(id)
        return item
          ? (item.getAttribute("aria-label") ??
              item.textContent?.replace("✓", "").trim())
          : null
      })
    await expect.poll(pointsAt).toBe("Cherry")
    // Grape is disabled, so the highlight skips it.
    await page.keyboard.press("ArrowDown")
    await expect.poll(pointsAt).toBe("Lemon")
    await page.keyboard.press("End")
    await expect.poll(pointsAt).toBe("Orange")
    await page.keyboard.press("Home")
    await expect.poll(pointsAt).toBe("Apple")
    await page.keyboard.press("m")
    await expect.poll(pointsAt).toBe("Mango")
    await expect(trigger(page)).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(listbox(page)).toBeHidden()
    expect(await lastAction(page)).toBe("value:mango")
    await expect(trigger(page)).toBeFocused()
    await expect(trigger(page)).not.toHaveAttribute("aria-activedescendant")
  })

  test("with virtualFocus, Tab closes the list and moves on from the trigger", async ({
    page,
    open,
  }) => {
    await open("select", { "virtual-focus": "" })
    await trigger(page).focus()
    await page.keyboard.press("ArrowDown")
    await expect(listbox(page)).toBeVisible()
    await page.keyboard.press("Tab")
    await expect(listbox(page)).toBeHidden()
    // WebKit's Tab skips buttons by default, so focus may leave the page.
    await expect(trigger(page)).not.toBeFocused()
  })

  test("with virtualFocus, a click on an item chooses it and keeps focus on the trigger", async ({
    page,
    open,
  }) => {
    await open("select", { "virtual-focus": "" })
    await trigger(page).click()
    await expect(trigger(page)).toBeFocused()
    await option(page, "Banana").click()
    await expect(listbox(page)).toBeHidden()
    expect(await lastAction(page)).toBe("value:banana")
    await expect(trigger(page)).toBeFocused()
  })
})
