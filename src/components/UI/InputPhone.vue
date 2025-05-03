<script setup>
import { ref, computed } from 'vue'

defineProps({
  placeholder: {
    type: String,
  },
})

const rawPhone = ref('')

const formattedPhone = computed({
  get() {
    return formatPhone(rawPhone.value)
  },
  set(value) {
    rawPhone.value = value.replace(/\D/g, '')
  },
})

const formatPhone = (phone) => {
  if (!phone) return ''

  let formattedInputValue = ''
  const inputNumbersValue = phone.replace(/\D/g, '')

  if (['7', '8', '9'].indexOf(inputNumbersValue[0]) > -1) {
    if (inputNumbersValue[0] === '9') {
      inputNumbersValue = '7' + inputNumbersValue
    }
    const firstSymbols = inputNumbersValue[0] === '8' ? '8' : '+7'
    formattedInputValue = firstSymbols + ' '
    if (inputNumbersValue.length > 1) {
      formattedInputValue += '(' + inputNumbersValue.substring(1, 4)
    }
    if (inputNumbersValue.length >= 5) {
      formattedInputValue += ') ' + inputNumbersValue.substring(4, 7)
    }
    if (inputNumbersValue.length >= 8) {
      formattedInputValue += '-' + inputNumbersValue.substring(7, 9)
    }
    if (inputNumbersValue.length >= 10) {
      formattedInputValue += '-' + inputNumbersValue.substring(9, 11)
    }
  } else {
    formattedInputValue = '+' + inputNumbersValue.substring(0, 16)
  }
  return formattedInputValue
}

const onPhoneInput = (e) => {
  const input = e.target
  const selectionStart = input.selectionStart

  if (!rawPhone.value) {
    rawPhone.value = ''
    return
  }

  if (input.value.length !== selectionStart) {
    if (e.data && /\D/g.test(e.data)) {
      rawPhone.value[1] = rawPhone.value[1] === '8' ? '' : rawPhone.value[1]
      input.value = formattedPhone.value
    }
    return
  }
}

const onPhoneKeyDown = (e) => {
  if (e.keyCode === 8 && rawPhone.value.length === 1) {
    rawPhone.value = ''
  }
}

const onPhonePaste = (e) => {
  const pasted = e.clipboardData || window.clipboardData
  if (pasted) {
    const pastedText = pasted.getData('Text')
    if (!/\D/g.test(pastedText)) {
      rawPhone.value = rawPhone.value
    }
  }
}

const onPhoneClick = (e) => {
  const input = e.target
  input.setSelectionRange(4, 4)
}
</script>
<template>
  <input
    type="text"
    v-model="formattedPhone"
    @input="onPhoneInput"
    @keydown="onPhoneKeyDown"
    @paste="onPhonePaste"
    @click="onPhoneClick"
    :placeholder="placeholder"
    maxlength="18"
  />
</template>

<style lang="scss" scoped>
/* Добавьте стили, если необходимо */
</style>
