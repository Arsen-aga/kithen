<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import IconArrow from '@/components/icons/IconArrow.vue'
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  classArrow: String,
})

const isOpen = ref(false)
const selectedValue = ref('')

const selectedText = computed(() => {
  const selectedItem = props.items.find((item) => item.title === selectedValue.value)
  return selectedItem ? selectedItem.title : props.items[0].title
})

const toggleSelect = () => {
  isOpen.value = !isOpen.value
}

const selectItem = (item) => {
  selectedValue.value = item.title
  isOpen.value = false
}

// Close the dropdown if clicked outside
const handleClickOutside = (event) => {
  const selectElement = event.target.closest('.custom-select')
  if (!selectElement) {
    isOpen.value = false
  }
}

// Add event listener for clicks outside the component
document.addEventListener('click', handleClickOutside)

// Cleanup the event listener when the component is unmounted
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="custom-select" @click.stop="toggleSelect">
    <IconArrow class="custom-select__arrow" :class="classArrow" />
    <div class="custom-select__wrapper">
      <div class="select-selected">{{ selectedText }}</div>
    </div>
    <input type="hidden" :value="selectedValue" />
    <div class="select-items" v-show="isOpen">
      <div
        v-for="item in items"
        :key="item.title"
        :data-select="item.title"
        @click.stop="selectItem(item)"
        :class="{ active: selectedValue === item.title }"
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-select {
  position: relative;
  cursor: pointer;
  &__arrow {
    position: absolute;
    top: 50%;
    right: 30px;
    display: block;
    width: 12px;
    height: 7px;
    background-position: center center;
    /* x y */
    background-repeat: no-repeat;

    &.rigth20 {
      right: 20px;
    }
  }

  &__wrapper {
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 200px;
    width: 100%;
    overflow: hidden;
  }

  .select-selected {
    display: flex;
    align-items: center;
    position: relative;
  }

  .select-items {
    position: absolute;
    left: 0;
    background-color: var(--light-color);
    display: grid;
    border: 1px solid rgba($color: #000000, $alpha: 0.1);
    max-height: 300px;
    width: 100%;
    overflow-y: auto;
    z-index: 10;
    bottom: 0;
    transform: translateY(100%);

    p,
    div {
      padding: 10px 5px;
      border-bottom: 1px solid rgba($color: #000000, $alpha: 0.1);
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #c0f6ff;
        color: var(--primary);
      }

      &:last-child {
        border-bottom: none;
      }

      &.active {
        background-color: var(--primary-color);
        color: var(--light-color);
      }
    }
  }
}
</style>
