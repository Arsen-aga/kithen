<script setup>
import { computed } from 'vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'
import LinkButton from '@/components/UI/LinkButton.vue'
import InputPhone from '@/components/UI/InputPhone.vue'
import SelectItems from '@/components/UI/SelectItems.vue'
import InputCalendar from '@/components/UI/InputCalendar.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isCalendar: {
    type: Boolean,
    default: false,
  },
  isShipping: {
    type: Boolean,
    default: false,
  },
})

const isInputPhone = computed(() => props.item.id === 1)
const isSimpleInput = computed(() => !props.item.list && props.item.id !== 1)
const isSelectItems = computed(() => props.item.list)
const isRefreshVisible = computed(() => props.item.id === 0 || props.item.id === 5)
const inputValue = computed(() => (props.item.id === 7 ? '' : props.item.value))
const inputPlaceholder = computed(() => (props.item.id === 7 ? props.item.value : ''))
</script>

<template>
  <div class="treaty-item">
    <h6 class="treaty-item__title">
      {{ item.title }}
    </h6>
    <InputPhone v-if="isInputPhone" class="treaty-item__inp" :placeholder="item.value" />
    <input
      v-if="isSimpleInput && !isCalendar"
      class="treaty-item__inp"
      :class="{ floor: item.id === 2 }"
      :type="item.type"
      :value="inputValue"
      :placeholder="inputPlaceholder"
      :disabled="!item.change"
    />

    <SelectItems v-if="isSelectItems" class="treaty-item__inp" :items="item.values" />
    <InputCalendar v-if="isCalendar" :isShipping="isShipping" />

    <div v-if="isRefreshVisible" class="treaty-item__refresh">
      <IconRefresh />
      <LinkButton>Обновить</LinkButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.treaty-item {
  &__title {
    font-family: 'Jost';
    font-weight: 600;
    font-size: 12px;
    line-height: calc(20 / 12 * 100%);
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  &__inp {
    width: 100%;
    height: 76px;
    padding: 26px 25px 24px;
    background-color: var(--light-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-family: 'Jost';
    font-weight: 400;
    font-size: 18px;
    line-height: calc(26 / 18 * 100%);
    color: var(--default-color);

    &::placeholder {
      color: rgba($color: #464451, $alpha: 0.3);
    }

    &.floor {
      max-width: 120px;
    }
  }

  &__refresh {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
}
</style>
