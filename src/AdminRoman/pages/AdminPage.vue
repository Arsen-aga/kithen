<script>
import SideBarAdmin from "../blocks/SideBarAdmin.vue";
import HeaderAdmin from "../blocks/HeaderAdmin.vue";
import ListsBlock from "../blocks/ListsBlock.vue";
import UniversalPage from "../blocks/UniversalPage.vue";
import MetrikaBlock from "../blocks/MetrikaBlock.vue";
import router from "@/router/router";
export default {
  name: "AdminPage",
  components: {
    SideBarAdmin,
    HeaderAdmin,
    ListsBlock,
    UniversalPage,
    MetrikaBlock,
  },
  data() {
    return {
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      categories: [
        {
          id: 1,
          name: "Видео",
        },
        {
          id: 2,
          name: "Подкасты",
        },
        {
          id: 3,
          name: "Темы",
        },
      ],
      list: true,
      updatePage: false,
      propsPage: "metrika",
      itemPage: null,
    };
  },
  methods: {
    goToCategory(item = false) {
      if (item) {
        this.itemPage = item;
      }
      this.list = false;
      this.updatePage = true;
    },
    goTo(item) {
      switch (item) {
        case "podcasts":
          this.propsPage = "podcast";
          break;
        case "news":
          this.propsPage = "news";
          break;
        case "video":
          this.propsPage = "video";
          break;
        case "podcast-category":
          this.propsPage = "podcast-category";
          break;
        case "news-category":
          this.propsPage = "news-category";
          break;
        case "video-category":
          this.propsPage = "video-category";
          break;
        case "book-category":
          this.propsPage = "book-category";
          break;
        case "test-category":
          this.propsPage = "test-category";
          break;
        case "material":
          this.propsPage = "material";
          break;
        case "theme":
          this.propsPage = "theme";
          break;
        case "notify":
          this.propsPage = "notify";
          break;
        case "test":
          this.propsPage = "test";
          break;
        case "blogger":
          this.propsPage = "blogger";
          break;
        case "book":
          this.propsPage = "book";
          break;
      }
      if (!this.list) {
        this.list = true;
        this.updatePage = false;
      }
    },
  },
  mounted() {
    if (
      this.user.username === "guest" ||
      this.user.username != "potapov.roma@mail.ru"
    ) {
      router.push("/nelzya-tuda");
    }
  },
};
</script>

<template>
  <div class="wrapperAcc">
    <div class="sidebar">
      <SideBarAdmin @goTo="goTo" />
    </div>
    
    <div class="info">
      <HeaderAdmin />
      <metrika-block v-if="propsPage == 'metrika'" />
      <ListsBlock
        v-if="list && propsPage != 'metrika'"
        @goToCategory="goToCategory"
        :propsPage="propsPage"
        :type="typePage"
      />
      <UniversalPage v-if="updatePage && !itemPage && propsPage != 'metrika'" :propsPage="propsPage" />
      <UniversalPage
        v-if="updatePage && itemPage && propsPage != 'metrika'"
        :propsPage="propsPage"
        :item="itemPage"
      />
    </div>
  </div>
</template>
<style scoped>
.wrapperAcc {
  display: flex;
  background: #f5f7f8;
  padding-right: 30px;
  gap: 51px;
}
.sidebar {
  width: 308px;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  background: #333333;
}
.info {
  width: 100%;
  max-width: 954px;
}
</style>