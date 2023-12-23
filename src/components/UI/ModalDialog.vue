<template>
  <!-- Main modal -->
  <Teleport to="#app">
    <div :id="id" class="inset-0 fixed pt-4 z-20">
      <div class="relative mx-auto w-full max-w-2xl max-h-full z-10">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <!-- Modal header -->
          <div
            class="flex items-start justify-between border-b rounded-t dark:border-gray-600"
          >
            <slot name="header">{{}}</slot>
          </div>
          <!-- Modal body -->
          <div class="p-6 space-y-6">
            <slot name="body"></slot>
          </div>
          <!-- Modal footer -->
          <div
            class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-black fixed inset-0 opacity-50 z-10"></div>
  </Teleport>
</template>

<script>
export default {
  props: ["name", "id"],
};
</script>
