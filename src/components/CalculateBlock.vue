<script setup>
import { ref, onBeforeMount, watch } from 'vue'
import { getData } from '@/api/getData'
import { useCatalogBlock } from '@/stores/catalogBlock'
import UserBlock from '@/components/UserBlock.vue'
import AccordionItem from '@/components/AccordionItem.vue'
import AccordionSmeta from '@/components/AccordionSmeta.vue'
import MarketBlock from '@/components/MarketBlock.vue'
import SelectedProducts from '@/components/SelectedProducts.vue'
import ScrollTableBlock from '@/components/ScrollTableBlock.vue'
import TreatyBlock from '@/components/TreatyBlock.vue'
import CatalogBlock from '@/components/CatalogBlock.vue'
import { useCookies } from 'vue3-cookies'

import { useDefaultItems } from '@/stores/default'
import { useResultItems } from '@/stores/result'
import axios from 'axios'
const { addItem } = useResultItems()
const store = useDefaultItems()
const { cookies } = useCookies()
const bearer = cookies.get('user-bearer')
const headersGet = {
  headers: {
    Authorization: 'Bearer ' + bearer,
  },
}

const itemSmeta = ref('')
const itemMarket = ref('')
const { catalogBlock } = useCatalogBlock()
const itemHouseholdAppliances = ref('')
const itemSelectedProducts = ref('')
const itemTechnicallyComplexProducts = ref('')
const itemServices = ref('')
const itemTreaty = ref('')

const marketGroups = ref([])

const getMarket = async () => {
  console.log()
  try {
    const response = await axios.get(`${store.getApiDomain}/product-groups`, headersGet)
    marketGroups.value = response.data || []
    console.log('marketGroups.value', marketGroups.value)
  } catch (error) {
    console.error('Ошибка получения контента маркета', error)
    marketGroups.value = []
  }
}
onBeforeMount(async () => {
  // itemSmeta.value = await getData('../../data/smeta.json')
  // if (itemSmeta.value) {
  //   itemSmeta.value.items.forEach((item) => {
  //     item.table.forEach((elem) => {
  //       addItem(item.id, elem)
  //     })
  //   })
  // }
  await getMarket()
  itemMarket.value = await getData('../../data/market.json')

  // itemHouseholdAppliances.value = await getData('../../data/household-appliances.json')
  // itemSelectedProducts.value = await getData('../../data/selected-products.json')
  // itemTechnicallyComplexProducts.value = await getData('../../data/technically-complex-products.json')
  // itemServices.value = await getData('../../data/services.json')
  // itemTreaty.value = await getData('../../data/treaty.json')
})

const isOpenCatalog = ref(false)
watch(
  () => catalogBlock.value,
  () => {
    isOpenCatalog.value = !isOpenCatalog.value
  }
)
</script>

<template>
  <div class="calculate-block">
    <UserBlock class="calculate-block__header" />
    <div class="calculate-block__accordion">
      <AccordionItem v-if="itemSmeta" :content="itemSmeta" :title="itemSmeta.title">
        <AccordionSmeta :items="itemSmeta.items" />
      </AccordionItem>

      <AccordionItem
        v-if="marketGroups && marketGroups.length > 0"
        :content="marketGroups"
        :title="isOpenCatalog ? 'Каталог товаров' : 'Маркет'"
      >
        <MarketBlock :items="marketGroups" v-show="!isOpenCatalog" />
        <CatalogBlock v-show="catalogBlock.value && isOpenCatalog" :products="catalogBlock.value" />
      </AccordionItem>

      <AccordionItem
        v-if="itemHouseholdAppliances"
        :content="itemHouseholdAppliances"
        :title="itemHouseholdAppliances.title"
      ></AccordionItem>
      <AccordionItem v-if="itemSelectedProducts" :content="itemSelectedProducts" :title="itemSelectedProducts.title">
        <SelectedProducts :items="itemSelectedProducts.items" />
      </AccordionItem>
      <AccordionItem
        v-if="itemTechnicallyComplexProducts"
        :content="itemTechnicallyComplexProducts"
        :title="itemTechnicallyComplexProducts.title"
      >
        <ScrollTableBlock :items="itemTechnicallyComplexProducts.items" />
      </AccordionItem>
      <AccordionItem v-if="itemServices" :content="itemServices" :title="itemServices.title">
        <ScrollTableBlock :items="itemServices.items" />
      </AccordionItem>
      <AccordionItem v-if="itemTreaty" :content="itemTreaty" :title="itemTreaty.title">
        <TreatyBlock :items="itemTreaty.items" />
        <UserBlock class="calculate-block__bottom" />
      </AccordionItem>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calculate-block {
  max-width: 1030px;
  width: 100%;
  background-color: var(--light-color);
  border-radius: 30px;
  padding: 30px 50px;
  margin-left: auto;
  display: flex;
  flex-direction: column;

  &__header {
    margin-bottom: 30px;
  }

  &__accordion {
    display: grid;
    gap: 10px;
  }

  &__bottom {
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px solid rgba($color: #464451, $alpha: 0.1);
  }
}
</style>
