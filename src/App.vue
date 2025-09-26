<script setup>
import { useAuth } from '@/helpers/useAuth'

const { userId, userBearer } = useAuth()
</script>

<template>
  <router-view></router-view>
</template>
