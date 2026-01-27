<script setup>
import { ref, onBeforeMount, watch, computed } from 'vue'
import UserBlock from '@/components/UserBlock.vue'
import AccordionItem from '@/components/AccordionItem.vue'
import AccordionSmeta from '@/components/AccordionSmeta.vue'
import MarketBlock from '@/components/MarketBlock.vue'
import SelectedProducts from '@/components/SelectedProducts.vue'
import ScrollTableBlock from '@/components/ScrollTableBlock.vue'
import TreatyBlock from '@/components/TreatyBlock.vue'
import CatalogBlock from '@/components/CatalogBlock.vue'
// import { getData } from '@/api/getData'
import { useApi } from '@/helpers/useApi'
import { useCatalogBlock } from '@/stores/catalogBlock'

const { get } = useApi()

// import { useResultItems } from '@/stores/result'
// const { addItem } = useResultItems()
const storeCatalog = useCatalogBlock()

const itemSmeta = ref('')
// const itemMarket = ref('')

const itemHouseholdAppliances = ref('')
const itemSelectedProducts = ref('')
const itemTechnicallyComplexProducts = ref('')
const itemServices = ref('')
const itemTreaty = ref('')

const marketGroups = ref([])


const getMarket = async () => {
  try {
    const response = await get('product-groups?level=0')

    // Преобразуем ответ в массив (даже если это один объект)
    const data = Array.isArray(response) ? response : [response].filter(Boolean)

    marketGroups.value = data.slice(0, 13)
    console.log('marketGroups.value', marketGroups.value)
    return data // Возвращаем массив для внешнего использования
  } catch (error) {
    console.error('Ошибка получения данных маркета', error)
    marketGroups.value = []
    return []
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
  // itemMarket.value = await getData('../../data/market.json')
  // itemHouseholdAppliances.value = await getData('../../data/household-appliances.json')
  // itemSelectedProducts.value = await getData('../../data/selected-products.json')
  // itemTechnicallyComplexProducts.value = await getData('../../data/technically-complex-products.json')
  // itemServices.value = await getData('../../data/services.json')
  // itemTreaty.value = await getData('../../data/treaty.json')
})


</script>

<template>
  <div class="calculate-block">
    <UserBlock class="calculate-block__header" />
    <div class="calculate-block__accordion">
      <AccordionItem v-if="itemSmeta" :title="itemSmeta.title">
        <AccordionSmeta :items="itemSmeta.items" />
      </AccordionItem>
      <AccordionItem
        v-if="marketGroups && marketGroups.length > 0"
        :title="storeCatalog.isOpenCatalog ? 'Каталог товаров' : 'Маркет'"
      >
        <MarketBlock :items="marketGroups" v-show="!storeCatalog.isOpenCatalog" />
        <CatalogBlock
          v-show="storeCatalog.catalogCategory && storeCatalog.isOpenCatalog"
          :group-id="storeCatalog.catalogCategory"
        />
      </AccordionItem>

      <!-- <AccordionItem
        v-if="itemHouseholdAppliances"
        content="link"
        :title="itemHouseholdAppliances.title"
      ></AccordionItem> -->
      <AccordionItem  title="Выбранные товары">
        <SelectedProducts />
      </AccordionItem>
      <!-- <AccordionItem
        v-if="itemTechnicallyComplexProducts"
        :title="itemTechnicallyComplexProducts.title"
      >
        <ScrollTableBlock :items="itemTechnicallyComplexProducts.items" />
      </AccordionItem>
      <AccordionItem v-if="itemServices" :title="itemServices.title">
        <ScrollTableBlock :items="itemServices.items" />
      </AccordionItem>
      <AccordionItem v-if="itemTreaty" :title="itemTreaty.title">
        <TreatyBlock :items="itemTreaty.items" />
        <UserBlock class="calculate-block__bottom" />
      </AccordionItem> -->
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
