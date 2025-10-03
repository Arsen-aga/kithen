<script setup>
import { useCatalogBlock } from '@/stores/catalogBlock'
import axios from 'axios'
import { useCookies } from 'vue3-cookies'
import { useDefaultItems } from '@/stores/default'
import { toast } from 'vue3-toastify'
const { cookies } = useCookies()
defineProps({
  marketItem: {
    type: Object,
    default: () => ({}),
  },
})

const store = useDefaultItems()
const bearer = cookies.get('user-bearer')
const headersGet = {
  headers: {
    Authorization: 'Bearer ' + bearer,
  },
}
const getProducts = async (groupId) => {
  try {
    const response = await axios.get(`${store.getApiDomain}/products`, headersGet)
    const productsInGroup = response.data.filter((product) => product.Group === groupId)
    if (productsInGroup.length === 0) {
      toast.error('В данной категории нет товаров', { autoClose: 1000 })
      throw new Error('В данной категории нет товаров')
    }
    catalogBlock.value = productsInGroup
  } catch (error) {
    console.error(error)
  }
}

const { catalogBlock } = useCatalogBlock()
const openCatalog = async (groupId) => {
  try {
    await getProducts(groupId)
  } catch (error) {
    console.log('В данной категории нет товаров', error)
  }
}
</script>

<template>
  <div class="market-item" @click="() => openCatalog(marketItem?.id)">
    <img
      v-if="marketItem?.img"
      class="market-item__img _img"
      :src="marketItem.img"
      :alt="marketItem.Name || 'Product'"
    />
    <div v-else class="market-item__placeholder">No Image</div>
    <div v-if="marketItem?.products?.length" class="market-item__num">
      {{ marketItem.products.length }}
    </div>

    <h4 class="market-item__title">
      {{ marketItem?.Name || 'Без названия' }}
    </h4>
  </div>
</template>

<style lang="scss" scoped>
.market-item {
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  height: 280px;
  cursor: pointer;

  img {
    transition: all 0.5s ease-in-out;
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    background: #dba15094;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
  }

  &:hover {
    img {
      scale: 1.5;
    }
  }

  &__num {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: var(--light-color);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    box-shadow: 0px 10px 20px rgba(236, 17, 17, 0.25);
    font-family: 'Jost';
    font-weight: 500;
    font-size: 14px;
    line-height: calc(22 / 14 * 100%);
  }

  &__title {
    position: absolute;
    left: 20px;
    bottom: 20px;
    font-family: 'Jost';
    font-weight: 500;
    font-size: 22px;
    line-height: calc(30 / 22 * 100%);
    color: var(--light-color);
  }
}
</style>
