<script>
import axios from "axios";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import VCalendar from "v-calendar";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "v-calendar/style.css";

import TestElement from "../elements/TestElement.vue";
export default {
  name: "UniversalPage",
  components: {
    EditorContent,
    TestElement,
    VCalendar,
  },
  props: {
    propsPage: {
      type: String,
    },
    item: {
      type: Object,
      required: false,
    },
    modelValue: String,
  },
  watch: {
    modelValue(value) {
      if (this.editor && this.editor.getHTML() !== value) {
        this.editor.commands.setContent(value);
      }
    },
  },
  data() {
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    return {
      isCalendarVisible: false,
      dateRange: null,
      timestampPublish: null,
      formattedDate: "Выберите дату", // Форматированная дата
      attributes: [
        {
          highlight: true,
          dates: new Date(),
        },
      ],
      disabledDates: [{ start: null, end: yesterday }],
      user: this.$store.getters.getUser,
      apiUrl: this.$store.getters.getApiUrl,
      apiDomain: this.$store.getters.getApiDomain,
      testData: null,
      formData: {
        image: "",
        text: this.modelValue || "",
        theme: "",
        type: "text",
        shortText: "",
        audio: "",
        videoUrl: "",
        categorieId: "",
        bookSrc: "",
      },
      itemData: {},
      imagePreview: null,
      srcPhoto: null,
      dopBannerSrc: null,
      dopBannerSrc2: null,
      headerBannerSrc: null,
      bookSrc: null,
      sizePdf: null,
      dopQuote: "",
      themesReset: [],
      categoriesReset: [],
      bloggerReset: [],
      blogger_id: null,
      sort: 0,

      state: {
        content: "",
      },
      editor: null,

      flagCategry: false,
    };
  },

  methods: {
    handleDateChange(timestamp = false) {
      if (timestamp) {
        const date = new Date(timestamp);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяц начинается с 0
        const year = date.getFullYear();

        // Формируем строку в формате дд.мм.гггг
        this.formattedDate = `${day}.${month}.${year}`;
      }
      if (this.dateRange) {
        const date = new Date(this.dateRange);
        // Форматируем дату в чч.мм.гггг
        this.formattedDate = date
          .toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "."); // В некоторых системах может быть "/"

        // Таймштамп текущей даты
        this.timestampPublish = date.getTime();
        // Начало дня
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        this.timestampStart = startOfDay.getTime();

        // Конец дня
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        this.timestampEnd = endOfDay.getTime();
      }
    },
    toggleCalendar() {
      this.isCalendarVisible = !this.isCalendarVisible;
    },
    handleClickOutside(event) {
      const calendar = this.$refs.calendar;
      const button = this.$refs.button;

      if (
        calendar &&
        !calendar.contains(event.target) &&
        button &&
        !button.contains(event.target)
      ) {
        this.isCalendarVisible = false;
      }
    },
    async handleImageUpload(event) {
      try {
        // Вызов вашего метода для загрузки фото
        await this.uploadPhoto(event, false, false, false, true);

        // Получаем URL загруженного изображения
        const imageUrl = this.formData.image;

        // Вставляем изображение в редактор
        this.editor
          .chain()
          .focus()
          .setImage({ src: this.apiDomain + "/web/uploads/" + imageUrl })
          .run();
      } catch (error) {
        console.error("Ошибка загрузки изображения:", error);
        alert("Ошибка при загрузке изображения. Попробуйте снова.");
      }
    },
    addImage() {
      const url = window.prompt("URL");

      if (url) {
        this.editor.chain().focus().setImage({ src: url }).run();
      }
    },
    // Метод для обработки изменения изображения
    async uploadPhoto(
      event,
      dopBanner = false,
      headerBanner = false,
      dopBanner2 = false,
      content = false
    ) {
      let file;
      if (headerBanner) {
        let item = document.getElementById("headerBanner");
        file = item.files[0];
      }
      if (dopBanner) {
        let item = document.getElementById("dopBanner");
        file = item.files[0];
      } else if (dopBanner2) {
        let item = document.getElementById("dopBanner2");
        file = item.files[0];
      } else if (!dopBanner && !headerBanner && !dopBanner2) {
        file = event.target.files[0];
      }

      if (!file) {
        return;
      }

      let validFileTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!validFileTypes.includes(file.type)) {
        alert("Можно загружать только файлы формата JPG или PNG.");
        return;
      }

      let formData = new FormData();
      formData.append("UploadForm[file]", file);
      formData.append("folder", "users/avatar");
      formData.append("filenamePrefix", "avatar_");

      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;

      try {
        let response = await axios.post(
          this.apiUrl + "upload" + authGet,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (dopBanner) {
          this.dopBannerSrc = response.data;
        } else if (headerBanner) {
          this.headerBannerSrc = response.data;
        } else if (dopBanner2) {
          this.dopBannerSrc2 = response.data;
        } else if (content) {
          this.formData.image = response.data;
        } else {
          this.srcPhoto = response.data;
        }
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка при загрузке фото. Попробуйте еще раз.");
      }
    },
    async uploadBook(event) {
      let file = event.target.files[0];

      if (!file) {
        return;
      }

      let validFileTypes = [
        "application/pdf", // PDF
        "application/msword", // Microsoft Word (DOC)
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Microsoft Word (DOCX)
        "application/vnd.ms-excel", // Microsoft Excel (XLS)
        "application/vnd.ms-powerpoint", // Microsoft PowerPoint (PPT)
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // Microsoft PowerPoint (PPTX)
      ];

      if (!validFileTypes.includes(file.type)) {
        alert(
          "Можно загружать только файлы формата PDF, DOC, DOCX, PPT или PPTX."
        );
        return;
      }

      // Получаем размер файла в килобайтах (KB)
      let fileSizeKB = file.size / 1024;

      // Переменная для хранения размера файла
      let fileSizeDisplay;

      // Если размер файла больше 1024 KB, переводим в MB
      if (fileSizeKB > 1024) {
        let fileSizeMB = fileSizeKB / 1024;
        fileSizeDisplay = `${fileSizeMB.toFixed(2)} MB`;
      } else {
        fileSizeDisplay = `${fileSizeKB.toFixed(2)} KB`;
      }

      let formData = new FormData();
      formData.append("UploadForm[file]", file);
      formData.append("folder", "books/book");
      formData.append("filenamePrefix", "book_");

      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;

      try {
        let response = await axios.post(
          this.apiUrl + "upload" + authGet,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.bookSrc = response.data;

        // Сохраняем размер файла в переменную sizePdf
        this.sizePdf = fileSizeDisplay;
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка при загрузке файла. Попробуйте еще раз.");
      }
    },
    // Метод для обработки изменения аудио
    async onAudioChange(event) {
      let file = event.target.files[0];

      if (!file) {
        return;
      }
      let validFileTypes = ["audio/mpeg", "audio/ogg", "audio/wav"];
      if (!validFileTypes.includes(file.type)) {
        alert("Можно загружать только файлы формата MP3, OGG или WAV.");
        return;
      }

      let formData = new FormData();
      formData.append("UploadForm[file]", file);
      formData.append("folder", "users/audio");
      formData.append("filenamePrefix", "audio_");
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      try {
        let response = await axios.post(
          this.apiUrl + "upload" + authGet,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.formData.audio = response.data;
      } catch (error) {
        console.error("Ошибка:", error);
      }
    },
    getCategories() {
      if (
        !this.flagCategry &&
        this.propsPage !== "news" &&
        this.propsPage !== "theme" &&
        this.propsPage !== "notify" &&
        this.propsPage !== "blogger"
      ) {
        let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
        axios
          .get(
            this.apiUrl +
              "api-" +
              this.propsPage +
              "-category/get-list" +
              authGet
          )
          .then((response) => {
            this.categoriesReset = response.data.categories;
          })
          .catch((error) => {
            console.error("Error getCategories:", error);
          });
      }
    },
    getBloggers() {
      
        let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
        axios
        axios
        .get(`${this.apiUrl}api-blogger/get-list${authGet}`)
        .then((response) => {
          console.log('response', response);
            
            this.bloggerReset = response.data.bloggers
          })
          .catch((error) => {
            console.error("Error getCategories:", error);
          });
      
    },

    saveContent() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      if (this.flagCategry) {
        let params = {
          name: this.formData.title,
          description: this.formData.shortText,
        };
        if (this.item) {
          params.id = this.item.id;
          axios
            .post(
              this.apiUrl + "api-" + this.propsPage + "/update" + authGet,
              params
            )
            .then(() => {});
        } else {
          axios
            .post(
              this.apiUrl + "api-" + this.propsPage + "/set" + authGet,
              params
            )
            .then(() => {});
        }
      } else {
        let params = {};
        if (this.propsPage === "news") {
          params = {
            theme_id: this.formData.theme,
            author_id: this.user.user_id,
            title: this.formData.title,
            description: this.formData.shortText,
            content: this.formData.text,
            date_add: new Date(),
            title_photo: this.srcPhoto,
            short_text: this.formData.shortText,
            text: this.formData.text,
            date_publication: this.timestampPublish / 1000,
          };
        } else if (this.propsPage === "video") {
          params = {
            theme_id: this.formData.theme,
            category_id: this.formData.categorieId,
            title: this.formData.title,
            description: this.formData.shortText,
            link: this.formData.link,
            poster: this.srcPhoto,
            date_add: new Date(),
            sort: this.sort,
            date_publication: this.timestampPublish / 1000,
            blogger_id: this.blogger_id
          };
          console.log(params);
          
        } else if (this.propsPage === "blogger") {
          params = {
            title: this.formData.title,
            description: this.formData.shortText,
            link: this.formData.link,
            poster: this.srcPhoto,
          };
        }
         else if (this.propsPage === "podcast") {
          params = {
            theme_id: this.formData.theme,
            category_id: this.formData.categorieId,
            title: this.formData.title,
            description: this.formData.shortText,
            link: this.formData.audio,
            date_add: new Date(),
            pic: this.srcPhoto,
            sort: this.sort,
            date_publication: this.timestampPublish / 1000,
          };
        } else if (this.propsPage === "theme") {
          params = {
            id: this.itemData.id,
            name: this.formData.title,
            description: this.formData.shortText,
            podcast_banner: this.srcPhoto,
            banner: this.dopBannerSrc,
            banner_full: this.dopBannerSrc2,
            img: this.headerBannerSrc,
            quote: this.dopQuote,
            date_add: new Date(),
            date_publication: this.timestampPublish / 1000,
          };
        } else if (this.propsPage === "book") {
          params = {
            theme_id: this.formData.theme,
            title: this.formData.title,
            category_id: this.formData.categorieId,
            format: "PDF",
            size: this.sizePdf,
            link: this.bookSrc,
            poster: this.srcPhoto,
            date_add: new Date(),
            date_publication: this.timestampPublish / 1000,
          };
        } else if (this.propsPage === "material") {
          params = {
            theme_id: this.formData.theme,
            title: this.formData.title,
            category_id: this.formData.categorieId,
            format: "PDF",
            size: this.sizePdf,
            link: this.bookSrc,
            poster: this.srcPhoto,
            date_add: new Date(),
            date_publication: this.timestampPublish / 1000,
          };
        } else if (this.propsPage === "notify") {
          params = {
            title: this.formData.title,
            text: this.formData.shortText,
            link: this.formData.link,

            date_publication: this.timestampPublish / 1000,
          };
          console.log("notify", params);
        }

        if (this.item) {
          params.id = this.item.id;
          axios
            .post(
              this.apiUrl + "api-" + this.propsPage + "/update" + authGet,
              params
            )
            .then(() => {
              toast.success("Сохранено", {
                autoClose: 1000,
              });
            })
            .catch((error) => {
              toast.error("Произошла ошибка:" + error, {
                autoClose: 1000,
              });
            });
        } else {
          axios
            .post(
              this.apiUrl + "api-" + this.propsPage + "/set" + authGet,
              params
            )
            .then(() => {
              toast.success("Сохранено", {
                autoClose: 1000,
                color: "red",
              });
            })
            .catch((error) => {
              toast.error("Произошла ошибка:" + error, {
                autoClose: 1000,
              });
            });
        }
      }
    },
    getThemes() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      axios
        .get(this.apiUrl + "api-theme/get-list" + authGet)
        .then((response) => {
          this.themesReset = response.data.themes;
        });
    },
    handleSaveTest(test) {
      this.testData = test;
      toast.success("Тест сохранен", {
        autoClose: 1000,
      });
    },
    async sendToServer() {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;
      if (!this.testData) {
        alert("Сначала сохраните тест.");
        return;
      }
      if (this.item) {
        try {
          await axios.post(this.apiUrl + "api-test/update" + authGet, {
            id: this.item.id,
            theme_id: this.formData.theme,
            category_id: this.formData.categorieId,
            name: this.testData.name,
            description: this.testData.description,
            photo: this.srcPhoto,
          });
          let qIds = [];

          const questionResponse = await axios
            .get(
              this.apiUrl +
                "api-test-q/get-list" +
                authGet +
                "&test_id=" +
                this.item.id
            )
            .catch((error) => {
              console.error("Ошибка при отправке вопроса:", error);
            });

          const questionId = questionResponse.data.qs;
          qIds = questionId;
          // Отправляем ответы
          for (let j = 0; j < qIds.length; j++) {
            let id = qIds[j].id;
            let answersResponse = await axios.get(
              this.apiUrl +
                "api-test-a/get-list" +
                authGet +
                "&question_id=" +
                id
            );
            let answers = answersResponse.data.answer;
            for (let k = 0; k < answers.length; k++) {
              await axios
                .post(this.apiUrl + "api-test-a/del" + authGet, {
                  id: answers[k].id,
                })
                .then(() => {});
            }
            await axios
              .post(this.apiUrl + "api-test-q/del" + authGet, {
                id: id,
              })
              .then(() => {});
          }
          for (let i = 0; i < this.testData.questions.length; i++) {
            const question = this.testData.questions[i];

            const questionResponse = await axios
              .post(
                this.apiUrl + "api-test-q/set" + authGet,
                {
                  test_id: this.item.id,
                  question: question.question,
                  sort: i,
                },
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              )
              .catch((error) => {
                console.error("Ошибка при отправке вопроса:", error);
              });

            const questionId = questionResponse.data.testQ.id;

            // Отправляем ответы
            for (let j = 0; j < question.answers.length; j++) {
              const answer = question.answers[j];
              await axios.post(this.apiUrl + "api-test-a/set" + authGet, {
                question_id: questionId,
                text: answer.text,
                points: answer.points,
                sort: j,
              });
            }
          }
        } catch (error) {
          console.error("Ошибка при обновлении теста:", error);
        }
      } else {
        try {
          const testResponse = await axios.post(
            this.apiUrl + "api-test/set" + authGet,
            {
              theme_id: this.formData.theme,
              category_id: this.formData.categorieId,
              name: this.testData.name,
              description: this.testData.description,
              photo: this.srcPhoto,
            }
          );

          const testId = testResponse.data.test.id;

          // Отправляем вопросы и ответы
          for (let i = 0; i < this.testData.questions.length; i++) {
            const question = this.testData.questions[i];

            const questionResponse = await axios
              .post(
                this.apiUrl + "api-test-q/set" + authGet,
                {
                  test_id: testId,
                  question: question.question,
                  sort: i,
                },
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              )
              .catch((error) => {
                console.error("Ошибка при отправке вопроса:", error);
              });

            const questionId = questionResponse.data.testQ.id;

            // Отправляем ответы
            for (let j = 0; j < question.answers.length; j++) {
              const answer = question.answers[j];
              await axios.post(this.apiUrl + "api-test-a/set" + authGet, {
                question_id: questionId,
                text: answer.text,
                points: answer.points,
                sort: j,
              });
            }
          }

          toast.success("Тест успешно сохранен!", { autoClose: 1000 });
        } catch (error) {
          console.error("Ошибка при отправке теста:", error);
          toast.error("Ошибка при сохранении теста.");
        }
      }
    },
    async getQuestions(testId) {
      let authGet = `&auth=${this.user.username}:${this.user.auth_key}`;

      try {
        let response = await axios.get(
          this.apiUrl + "api-test-q/get-list&test_id=" + testId + authGet
        );

        return response.data.qs;
      } catch (error) {
        console.error("getQuestions2", error);
      }
    },
  },
  async mounted() {
    if (this.propsPage.includes("-category")) {
      this.flagCategry = true;
    }
    this.formData.type = this.propsPage;

    this.getCategories();
    this.getThemes();
    if (this.propsPage === "video") {
      this.getBloggers();
    }

    if (this.propsPage === "test") {
      this.srcPhoto = this.item?.photo;
      this.testData = {
        name: this.item?.name,
        description: this.item?.description,
        questions: [],
      };

      // Получаем вопросы
      try {
        const questions = await this.getQuestions(this.item?.id); // Ждем завершения промиса
        this.testData.questions = questions;
      } catch (error) {
        console.error("Ошибка при загрузке вопросов", error);
      }
    } else {
      this.itemData = this.item;
      this.formData.shortText =
        this.itemData?.description ||
        this.itemData?.short_text ||
        this.itemData?.text;
      this.formData.text = this.itemData?.content || this.itemData?.text;
      this.formData.title = this.itemData?.title || this.itemData?.name;
      this.formData.categorieId = this.itemData?.category_id;
      this.formData.link = this.itemData?.link;
      this.formData.audio = this.itemData?.link;
      this.srcPhoto =
        this.itemData?.title_photo ||
        this.itemData?.poster ||
        this.itemData?.podcast_banner ||
        this.itemData?.pic ||
        null;
      this.dopBannerSrc = this.itemData?.banner || null;
      this.dopBannerSrc2 = this.itemData?.banner_full || null;
      this.dopQuote = this.itemData?.quote || null;
      this.sort = this.itemData?.sort;
      this.timestampPublish = this.itemData?.date_publication * 1000 || null;
      this.bloggerId = this.itemData?.blogger_id;
    }
    if (this.timestampPublish) {
      this.handleDateChange(this.timestampPublish);
    }

    this.editor = new Editor({
      content: this.formData.text,
      extensions: [
        Document,
        Paragraph,
        Text,
        Image,
        Dropcursor,
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Image,
      ],
      onUpdate: ({ editor }) => {
        this.formData.text = editor.getHTML();
        this.$emit("update:modelValue", this.formData.text); // Обновляем v-model
      },
    });
  },
  beforeUnmount() {
    this.editor.destroy();
  },
};
</script>


<template>
  <div class="content-editor">
    <div class="wrap-calendar">
      <div class="price__item-btnCalendar" @click="toggleCalendar" ref="button">
        {{ formattedDate }}
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.9386 6.7124L10.0486 11.6024C9.47109 12.1799 8.52609 12.1799 7.94859 11.6024L3.05859 6.7124"
            stroke="#1A1A1A"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div v-if="isCalendarVisible" class="calendar-container" ref="calendar">
        <VDatePicker
          v-model="dateRange"
          :attributes="attributes"
          :disabled-dates="disabledDates"
          mode="dateTime"
          is24hr
          :columns="1"
          :is-range="false"
          @click:outside="isCalendarVisible = false"
          @update:model-value="handleDateChange()"
        />
        <VCalendar />
      </div>
    </div>
    <div v-if="propsPage != 'test'" class="form-group">
      <label for="title">Наименование</label>
      <input
        type="text"
        v-model="formData.title"
        value="{{itemData?.title || itemData?.name}}"
        placeholder="Название"
      />
    </div>
    <div v-if="propsPage == 'test'" class="form-group">
      <test-element
        v-if="!testData"
        :initialTestData="testData"
        @save="handleSaveTest"
      />
      <test-element
        v-if="testData?.questions"
        :initialTestData="testData"
        @save="handleSaveTest"
      />
    </div>
    <div
      v-if="
        propsPage === 'podcast-category' ||
        propsPage === 'video-category' ||
        propsPage === 'news-category'
      "
      class="form-group"
    >
      <label for="text">Краткое описание</label>
      <textarea
        v-model="formData.shortText"
        placeholder="Введите текст"
        value="{{itemData?.description || itemData?.short_text}}"
        rows="5"
      ></textarea>
    </div>
    <!-- Поле для загрузки изображения -->

    <div v-if="propsPage === 'theme'" class="form-group">
      <label for="image">Баннер страницы темы Шапка</label>
      <input
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        type="file"
        id="headerBanner"
        @change="uploadPhoto(event, false, true)"
      />
      <div v-if="!headerBannerSrc">
        <img
          v-if="itemData?.img"
          :src="apiDomain + 'web/uploads/' + itemData?.img"
          alt="Preview"
          class="image-preview"
        />
      </div>
      <div v-if="headerBannerSrc">
        <img
          :src="apiDomain + 'web/uploads/' + headerBannerSrc"
          alt="Preview"
          class="image-preview"
        />
      </div>
    </div>

    <div v-if="!this.flagCategry && propsPage != 'notify'" class="form-group">
      <label v-if="propsPage != 'theme'" for="image">Изображение</label>
      <label v-if="propsPage === 'theme'" for="image">Баннер подкастов</label>
      <input
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        type="file"
        @change="uploadPhoto"
      />
      <div v-if="!srcPhoto">
        <img
          v-if="
            itemData?.title_photo ||
            itemData?.poster ||
            itemData?.podcast_banner
          "
          :src="
            apiDomain + 'web/uploads/' + itemData?.title_photo ||
            itemData?.poster ||
            itemData?.podcast_banner
          "
          alt="Preview"
          class="image-preview"
        />
      </div>
      <div v-if="srcPhoto">
        <img
          :src="apiDomain + 'web/uploads/' + srcPhoto"
          alt="Preview"
          class="image-preview"
        />
      </div>
    </div>
    <div
      v-if="propsPage === 'book' || propsPage === 'material'"
      class="form-group"
    >
      <label for="image">Файл книги / материала</label>
      <input
        accept=".pdf,.epub,.fb2"
        type="file"
        id="fileBook"
        @change="uploadBook"
      />
    </div>
    <div v-if="propsPage === 'theme'" class="form-group">
      <label for="image">Баннер страницы темы</label>
      <input
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        type="file"
        id="dopBanner"
        @change="uploadPhoto(event, true)"
      />
      <div v-if="!dopBannerSrc">
        <img
          v-if="
            itemData?.title_photo ||
            itemData?.poster ||
            itemData?.podcast_banner ||
            itemData?.banner
          "
          :src="
            apiDomain + 'web/uploads/' + itemData?.title_photo ||
            itemData?.poster ||
            itemData?.podcast_banner ||
            itemData?.banner
          "
          alt="Preview"
          class="image-preview"
        />
      </div>
      <div v-if="dopBannerSrc">
        <img
          :src="apiDomain + 'web/uploads/' + dopBannerSrc"
          alt="Preview"
          class="image-preview"
        />
      </div>
    </div>
    <div v-if="propsPage === 'theme'" class="form-group">
      <label for="image">Баннер для фразы</label>
      <input
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        type="file"
        id="dopBanner2"
        @change="uploadPhoto(event, false, false, true)"
      />
      <div v-if="!dopBannerSrc2">
        <img
          v-if="itemData?.banner_full"
          :src="apiDomain + 'web/uploads/' + itemData?.banner_full"
          alt="Preview"
          class="image-preview"
        />
      </div>
      <div v-if="dopBannerSrc2">
        <img
          :src="apiDomain + 'web/uploads/' + dopBannerSrc2"
          alt="Preview"
          class="image-preview"
        />
      </div>
    </div>
    <div v-if="propsPage === 'theme'" class="form-group">
      <label for="title">Фраза анимации</label>
      <textarea
        v-model="dopQuote"
        placeholder="Введите текст"
        rows="5"
      ></textarea>
    </div>
    <div v-if="propsPage != 'test'" class="form-group">
      <label for="text">Краткое описание</label>
      <textarea
        v-model="formData.shortText"
        placeholder="Введите текст"
        rows="5"
      ></textarea>
      <!-- <quill-editor
        v-model="state.content"
        
      /> -->
    </div>
    <!-- Текстовое поле или редактор текста -->
    <div v-if="formData.type === 'news'" class="form-group">
      <label for="text">Основной контент</label>

      <div v-if="editor" class="tiltapContainer">
        <div class="control-group">
          <div class="button-group">
            <label for="fileNews">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-card-image"
                viewBox="0 0 16 16"
              >
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                <path
                  d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"
                />
              </svg>
            </label>
            <input id="fileNews" type="file" @change="handleImageUpload" />
            <!-- Инпут для выбора изображения -->
            <!-- <button @click="addImage">Insert image from URL</button> -->
            <button
              @click="editor.chain().focus().toggleOrderedList().run()"
              :class="{ 'is-active': editor.isActive('orderedList') }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-list-ol"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"
                />
                <path
                  d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"
                />
              </svg>
            </button>

            <button
              @click="editor.chain().focus().splitListItem('listItem').run()"
              :disabled="!editor.can().splitListItem('listItem')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-list-ol"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"
                />
                <path
                  d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"
                />
              </svg>
            </button>
            <button
              @click="editor.chain().focus().sinkListItem('listItem').run()"
              :disabled="!editor.can().sinkListItem('listItem')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-list"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                />
              </svg>
            </button>
            <!-- <button
              @click="editor.chain().focus().liftListItem('listItem').run()"
              :disabled="!editor.can().liftListItem('listItem')"
            >
              Lift list item
            </button> -->
            <button
              @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-type-h1"
                viewBox="0 0 16 16"
              >
                <path
                  d="M7.648 13V3H6.3v4.234H1.348V3H0v10h1.348V8.421H6.3V13zM14 13V3h-1.333l-2.381 1.766V6.12L12.6 4.443h.066V13z"
                />
              </svg>
            </button>
            <button
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-type-h2"
                viewBox="0 0 16 16"
              >
                <path
                  d="M7.495 13V3.201H6.174v4.15H1.32V3.2H0V13h1.32V8.513h4.854V13zm3.174-7.071v-.05c0-.934.66-1.752 1.801-1.752 1.005 0 1.76.639 1.76 1.651 0 .898-.582 1.58-1.12 2.19l-3.69 4.2V13h6.331v-1.149h-4.458v-.079L13.9 8.786c.919-1.048 1.666-1.874 1.666-3.101C15.565 4.149 14.35 3 12.499 3 10.46 3 9.384 4.393 9.384 5.879v.05z"
                />
              </svg>
            </button>
            <button
              @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-type-h3"
                viewBox="0 0 16 16"
              >
                <path
                  d="M11.07 8.4h1.049c1.174 0 1.99.69 2.004 1.724s-.802 1.786-2.068 1.779c-1.11-.007-1.905-.605-1.99-1.357h-1.21C8.926 11.91 10.116 13 12.028 13c1.99 0 3.439-1.188 3.404-2.87-.028-1.553-1.287-2.221-2.096-2.313v-.07c.724-.127 1.814-.935 1.772-2.293-.035-1.392-1.21-2.468-3.038-2.454-1.927.007-2.94 1.196-2.981 2.426h1.23c.064-.71.732-1.336 1.744-1.336 1.027 0 1.744.64 1.744 1.568.007.95-.738 1.639-1.744 1.639h-.991V8.4ZM7.495 13V3.201H6.174v4.15H1.32V3.2H0V13h1.32V8.513h4.854V13z"
                />
              </svg>
            </button>
            <button
              @click="editor.chain().focus().toggleBold().run()"
              :class="{ 'is-active': editor.isActive('bold') }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-type-bold"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"
                />
              </svg>
            </button>
          </div>
        </div>
        <editor-content :editor="editor" />
      </div>
    </div>

    <!-- Селектор темы -->
    <div v-if="propsPage != 'theme' && !this.flagCategry && propsPage != 'notify' && propsPage != 'blogger'" class="form-group">
      <label for="theme">Выберите тему</label>
      <select v-model="formData.theme">
        <option value="">Выберите тему</option>
        <option v-for="theme in themesReset" :key="theme" :value="theme.id">
          {{ theme.name }}
        </option>
      </select>
    </div>
    <div
      v-if="!this.flagCategry && propsPage != 'theme'  && propsPage != 'notify' && propsPage != 'blogger'"
      class="form-group"
    >
      <label for="theme">Выберите категорию</label>
      <select v-model="formData.categorieId">
        <option value="">Выберите тему</option>
        <option v-for="cat in categoriesReset" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>
    <div
      v-if="propsPage == 'video'  && propsPage != 'notify' && propsPage != 'blogger'"
      class="form-group"
    >
      <label for="theme">Выберите блогера</label>
      <select v-model="blogger_id">
        <option :selected="('clear' == blogger_id) || blogger_id == null" :value="'clear'">Выберите блогера</option>
        <option v-for="cat in bloggerReset" :key="cat.id" :selected="cat.id == blogger_id" :value="cat.id">
          {{ cat.title }}
        </option>
      </select>
    </div>

    <!-- Дополнительные поля в зависимости от типа -->
    <div v-if="formData.type === 'podcast'" class="form-group">
      <label for="audio">Аудиофайл</label>
      <input accept=".mp3,.ogg,.wav" type="file" @change="onAudioChange" />
    </div>
    <div v-if="propsPage == 'notify'" class="form-group">
      <label for="video">Ссылка на ресурс (полная)</label>
      <input v-model="formData.link" placeholder="Вставьте ссылку" />
    </div>
    <div v-if="formData.type === 'video'" class="form-group">
      <label for="video">Ссылка на видео (iframe)</label>
      <input
        v-model="formData.link"
        placeholder="Вставьте ссылку на iframe видео"
      />
    </div>
    <div
      v-if="formData.type === 'video' || formData.type === 'podcast'"
      class="form-group"
    >
      <label for="video">Сортировка</label>
      <input
        v-model="sort"
        placeholder="Укажите сортировку для видео"
        type="number"
        min="1"
        max="1000"
        step="1"
      />
    </div>

    <!-- Кнопка для сохранения -->
    <button v-if="propsPage != 'test'" @click="saveContent" class="btn-white">
      Сохранить
    </button>
    <button v-if="propsPage == 'test'" @click="sendToServer" class="btn-white">
      Сохранить
    </button>
  </div>
</template>
  <style scoped>
#fileNews {
  display: none;
}
.content-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 0 40px 0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
label {
  font-weight: 600;
  font-size: 16px;
  line-height: 18px;
  color: #333;
}
input,
textarea,
select {
  background: #f1f1f1;
  border: 1px solid #5f22c1;
  padding: 5px;
  min-height: 34px;
}
/* Basic editor styles */
.tiptap:first-child {
  margin-top: 0;
}

.tiptap img {
  display: block;
  height: auto;
  margin: 1.5rem 0;
  max-width: 100%;
}

.ProseMirror-selectednode {
  outline: 3px solid var(--purple);
}
.button-group {
  display: flex;
  gap: 10px;
}
.button-group button,
.button-group label {
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: 0.3s;
}
.button-group button.is-active {
  background: #5f22c16c;
}
.tiltapContainer {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}
.wrap-calendar {
  position: relative;
  width: max-content;
}

.price__item-btnCalendar {
  cursor: pointer;
  padding: 8px 15px;
  border: 1px solid #1a1a1a;
  border-radius: 7px;
  font-family: Aeroport;
  font-size: 16px;
  font-weight: 400;
  max-width: 233px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.calendar-container {
  position: absolute;
  top: 43px;
  transform: translateX(50%);
  right: 0;
  z-index: 4;
}
</style>
