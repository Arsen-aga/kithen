<script setup>
import { formatNum } from '@/helpers/formatNum'
import { toast } from 'vue3-toastify'
import MainButton from '@/components/UI/MainButton.vue'
import CatalogProductSlider from '@/components/CatalogProductSlider.vue'
import CatalogProductModal from '@/components/UI/CatalogProductModal.vue'
import { onMounted, ref } from 'vue'
import { useApi } from '@/helpers/useApi'
import { useFileManager } from '@/helpers/useFileManager'
import { useProducts } from '@/helpers/useProducts'

const { get } = useApi()
const { initFiles } = useFileManager()
const { getAttributes, getAttributeGroup } = useProducts()
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})
const images = ref([])
const video = ref([])
const options = ref([])
const isOpenModal = ref(false)
const productToModal = ref({ ...props.product })

// Методы для работы с файлами
const getFilesToProduct = async (productId) => {
  try {
    const response = await get(`external-product-to-files?external_product_id=${productId}`)
    return response
  } catch (error) {
    console.error('Ошибка загрузки файлов:', error)
    toast.error('Ошибка загрузки данных', { autoClose: 1000 })
  }
}

const initializeFiles = async () => {
  const files = await getFilesToProduct(props.product.id)
  images.value = initFiles(
    files?.filter((file) => file.type === 'photo'),
    'images'
  )

  video.value = initFiles(
    files?.filter((file) => file.type === 'video'),
    'video'
  )
}

const initializeOptions = async () => {
  try {
    const attributes = await getAttributes(props.product.id)
    for (const attribute of attributes) {
      console.log('attribute', attribute)
      const optionName = await getAttributeGroup(attribute.group_id)
      options.value.push({
        option: optionName,
        info: attribute.attribute_value,
      })
    }
  } catch (error) {
    console.log(error)
  }
}

const openModal = () => {
  isOpenModal.value = !isOpenModal.value
  document.body.style.overflow = 'hidden'
}

onMounted(async () => {
  await initializeFiles()
  await initializeOptions()
  productToModal.value = {
    ...productToModal.value,
    images: images.value,
    video: video.value,
    options: options.value,
  }
})
</script>

<template>
  <div>
    <div class="catalog-product">
      <CatalogProductSlider class="catalog-product__swiper-wrapper" :images="images" :id="product.id" :video="video" />
      <div class="catalog-product__info">
        <h4 class="catalog-product__title">{{ product.title }}</h4>
        <ul class="catalog-product__list" v-if="options">
          <li class="catalog-product__point" v-for="option in options" :key="option.id">
            <span>{{ option.option }}</span> {{ option.info }}
          </li>
        </ul>
        <div class="catalog-product__price">
          <span class="catalog-product__price-new">{{ formatNum(product.price, 0) }} ₽</span>
          <!-- <span class="catalog-product__price-old">{{ formatNum(product.Price_0, 0) }} ₽</span> -->
        </div>
        <div class="catalog-product__btns">
          <MainButton @click="openModal">Узнать подробнее</MainButton>
          <MainButton class="bg-red">Добавить к заказу</MainButton>
        </div>
      </div>
    </div>
    <CatalogProductModal v-if="isOpenModal" :product="productToModal" @close-modal="openModal" />
  </div>
</template>

<style lang="scss" scoped>
.catalog-product {
  background-color: var(--light-color);
  // max-height: 650px;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  transition: all 0.3s ease-in-out;
  position: relative;
  box-shadow: 0px 0px 2px rgba(163, 169, 183, 1);
  height: 100%;

  &:hover {
    z-index: 10;
    scale: 1.05;
    box-shadow: 0px 0px 70px rgba(163, 169, 183, 0.2);
  }

  &__info {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
  }
  &__list {
    margin: 5px 0 15px;
    display: grid;
  }
  &__point {
    font-family: 'Jost';
    font-weight: 400;
    font-size: 14px;
    line-height: calc(22 / 14 * 100%);

    span {
      color: var(--gray-color);
    }
  }

  &__price {
    margin-top: auto;
    display: flex;
    gap: 6px;
  }

  &__price-new {
    font-family: 'Jost';
    font-weight: 500;
    font-size: 22px;
    line-height: calc(30 / 22 * 100%);
    color: var(--accent-color);
  }
  &__price-old {
    margin-top: 5px;
    font-family: 'Jost';
    font-weight: 400;
    font-size: 16px;
    line-height: calc(24 / 16 * 100%);
    text-decoration: line-through;
    color: var(--gray-color);
  }
  &__btns {
    margin-top: 15px;
    display: grid;
    gap: 5px;
  }
}
</style>
