<script setup>
import { formatDate } from '@/helpers/formatDate'
import { useSmetaStore } from '@/stores/smeta/index'
import { computed } from 'vue'
const smetaStore = useSmetaStore()
const agreementDate = computed(() => formatToDate(smetaStore.smetaOrder?.s_date) ?? formatToDate())
const formatToDate = (date = null) => {
  const toDate = date ? new Date(date * 1000) : new Date()
  return formatDate(toDate)
}
</script>

<template>
  <input class="agreement-from" type="text" :value="agreementDate" disabled />
</template>

<style lang="scss" scoped>
.agreement-from {
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
}
</style>
