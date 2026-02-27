<script setup>
import { useSmetaStore } from '@/stores/smeta/index'
import { computed } from 'vue'

const smetaStore = useSmetaStore()
const floor = computed({
  get: () => smetaStore.smeta?.User_floor ?? 0,
  set: (value) => {
    if (smetaStore.smeta) {
      smetaStore.smeta.User_floor = value
    }
  }
})
</script>

<template>
  <input
    class="user-floor"
    type="number"
    :value="floor"
    min="0"
  />
</template>
<style lang="scss" scoped>
.user-floor {
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
  max-width: 120px;

  &::placeholder {
    color: rgba($color: #464451, $alpha: 0.3);
  }
}
</style>
