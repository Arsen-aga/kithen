<script setup>
import { ref } from 'vue'
import { formatDate } from '@/helpers/formatDate'
import CustomCalendar from '@/components/UI/CustomCalendar.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
const startDate = ref(new Date())
const isOpen = ref(false)
const openCalendar = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="input-calendar">
    <div class="input-calendar__inner" @click.stop="openCalendar">
      <input type="hidden" :value="startDate" />
      {{ formatDate(startDate) }}
      <IconCalendar class="input-calendar__icon" />
    </div>
    <CustomCalendar
      class="input-calendar__calendar"
      v-show="isOpen"
      :isShow="isOpen"
      :changeDate="startDate"
      @update:changeDate="startDate = $event"
      @update:isShow="isOpen = $event"
    />
  </div>
</template>

<style lang="scss" scoped>
.input-calendar {
  position: relative;
  &__inner {
    position: relative;
    cursor: pointer;
    width: 100%;
    height: 76px;
    padding: 26px 25px 24px;
    background-color: #fafbfc;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-family: 'Jost';
    font-weight: 400;
    font-size: 18px;
    line-height: calc(26 / 18 * 100%);
    color: var(--default-color);
    cursor: pointer;
  }

  &__icon {
    position: absolute;
    right: 25px;
    top: 50%;
    transform: translateY(-50%);
  }

  &__calendar {
    position: absolute;
    z-index: 10;
  }
}
</style>
