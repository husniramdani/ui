<script lang="ts">
  import { avatar } from "@ui-sdk/core/avatar"
  import { usePart, usePrimitive } from "../../src/primitive"

  // The image's own style is left out of the spread, as an owner that
  // styles the image itself does.
  const av = usePrimitive(avatar, () => ({ id: "a" }))
  const image = usePart(av, "image")
  const { style: _, ...attrs } = $derived(image.slot())
</script>

<span>
  <img {...attrs} src="a.png" alt="" />
</span>
