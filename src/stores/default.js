import { defineStore } from 'pinia'

export const useDefaultItems = defineStore('default', {
  state: () => {
    return {
      // all these properties will have their type inferred automatically
      apiDomain: 'https://back.love-kitchen.ru/web/index.php',
      user: {
        name: 'guest',
        id: 2,
        bearer: '028=4CA85a_c8c8_500+6c560Aca6d+$02-40-6CA_aAA+06a0C_e=0--+08Aa=0+0082-a2-8=B015CD+_0=58=5-=_-40d0--ca8_2+60A0$8-8E400AAc+20C552666-5C0-04_5$c5a4_00622_+0BC6$+aD-_',
        email: "guest@guest.guest",
        reset_token: null,
        status_id: 10,
        date_add: 1,
        date_update: 1
      }
    }
  },

  getters: {
    getApiDomain: (state) => state.apiDomain,
    getUser: (state) => state.user,
    getBearer: (state) => state.user.bearer
  },

  actions: {
    setApiDomain(domain) {
      this.apiDomain = domain
    },
    setUser(user) {
      this.user = user
    }
  }

})
