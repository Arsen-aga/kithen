import { ref } from 'vue'

export const useTreaty = (smeta) => {

  const initTreaty = () => {
    console.log('smeta.value', smeta.value);
  }

  const changePhone = (phone) => {
    smeta.value.User_phone = phone
  }

  return {
    initTreaty,
    changePhone
  }
}