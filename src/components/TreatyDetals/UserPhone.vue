<script setup>
import InputPhone from '@/components/UI/InputPhone.vue'
import { useSmetaStore } from '@/stores/smeta/index'
import { computed } from 'vue'

const smetaStore = useSmetaStore()
const userPhone = computed({
  get: () => smetaStore.smeta?.User_phone ?? '',
  set: (value) => {
    if (smetaStore.smeta) {
      smetaStore.smeta.User_phone = value
    }
  }
})
</script>

<template>
  <InputPhone class="treaty-item__inp" v-model="userPhone" placeholder="+7 (___) ___-__-__" />
</template>
