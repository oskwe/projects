import { createStore } from 'vuex'
import axios from 'axios'

const isDevelopment = process.env.NODE_ENV === 'development'

// Создание экземпляра axios для API запросов
const api = axios.create({
  baseURL: "http://localhost:5000/api/",
  timeout: 5000
})

const collectionUrl = (resource) => `${resource}/`
const itemUrl = (resource, id) => `${resource}/${id}`

export default createStore({
  state: {
    organizations: [],    // Список организаций
    proxies: [],         // Список доверенностей
    items: [],           // Список товаров
    positions: [],       // Список должностей
    individuals: [],     // Список физических лиц
    units: [],           // Список единиц измерения
    packageTypes: [],    // Список видов упаковки
    basisDocuments: [],  // Список оснований
    torg12Documents: [], // Список ТОРГ-12
    isLoading: false,    // Флаг загрузки
    currentProxy: null,  // Текущая доверенность для просмотра
    currentTorg12: null  // Текущая ТОРГ-12 для просмотра
  },
  mutations: {
    // Мутации для обновления состояния
    SET_ORGANIZATIONS(state, organizations) {
      state.organizations = organizations
    },
    SET_ITEMS(state, items) {
      state.items = items
    },
    SET_POSITIONS(state, positions) {
      state.positions = positions
    },
    SET_INDIVIDUALS(state, individuals) {
      state.individuals = individuals
    },
    SET_UNITS(state, units) {
      state.units = units
    },
    SET_PACKAGE_TYPES(state, packageTypes) {
      state.packageTypes = packageTypes
    },
    SET_BASIS_DOCUMENTS(state, basisDocuments) {
      state.basisDocuments = basisDocuments
    },
    SET_PROXIES(state, proxies) {
      state.proxies = proxies
    },
    SET_TORG12(state, torg12Documents) {
      state.torg12Documents = torg12Documents
    },
    SET_CURRENT_PROXY(state, proxy) {
      state.currentProxy = proxy
    },
    SET_CURRENT_TORG12(state, torg12) {
      state.currentTorg12 = torg12
    },
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading
    }
  },
  actions: {
    // ========== Действия для работы с товарами ==========
    async fetchItems({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('items'))
        commit('SET_ITEMS', response.data)
      } catch (error) {
        console.error('Error fetching items:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async addItem({ commit, dispatch }, item) {
      commit('SET_LOADING', true)
      try {
        await api.post(collectionUrl('items'), { title: item.title })
        await dispatch('fetchItems')
      } catch (error) {
        console.error('Error adding item:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateItem({ commit, dispatch }, { _id, ...item }) {
      commit('SET_LOADING', true)
      try {
        await api.put(collectionUrl('items'), { _id, title: item.title })
        await dispatch('fetchItems')
      } catch (error) {
        console.error('Error updating item:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteItem({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('items', id))
        await dispatch('fetchItems')
      } catch (error) {
        console.error('Error deleting item:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ========== Действия для работы с должностями ==========
    async fetchPositions({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('positions'))
        commit('SET_POSITIONS', response.data)
      } catch (error) {
        console.error('Error fetching positions:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async addPosition({ commit, dispatch }, position) {
      commit('SET_LOADING', true)
      try {
        await api.post(collectionUrl('positions'), { title: position.title })
        await dispatch('fetchPositions')
      } catch (error) {
        console.error('Error adding position:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updatePosition({ commit, dispatch }, { _id, ...position }) {
      commit('SET_LOADING', true)
      try {
        await api.put(collectionUrl('positions'), { _id, title: position.title })
        await dispatch('fetchPositions')
      } catch (error) {
        console.error('Error updating position:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deletePosition({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('positions', id))
        await dispatch('fetchPositions')
      } catch (error) {
        console.error('Error deleting position:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ========== Действия для работы с организациями ==========
    async fetchOrganizations({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('organizations'))
        commit('SET_ORGANIZATIONS', response.data)
      } catch (error) {
        console.error('Error fetching organizations:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async addOrganization({ commit, dispatch }, organization) {
      commit('SET_LOADING', true)
      try {
        await api.post(collectionUrl('organizations'), {
          title: organization.title,
          address: organization.address,
          OKPO: organization.OKPO
        })
        await dispatch('fetchOrganizations')
      } catch (error) {
        console.error('Error adding organization:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateOrganization({ commit, dispatch }, { _id, ...organization }) {
      commit('SET_LOADING', true)
      try {
        await api.put(collectionUrl('organizations'), {
          _id,
          title: organization.title,
          address: organization.address,
          OKPO: organization.OKPO
        })
        await dispatch('fetchOrganizations')
      } catch (error) {
        console.error('Error updating organization:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteOrganization({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('organizations', id))
        await dispatch('fetchOrganizations')
      } catch (error) {
        console.error('Error deleting organization:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ========== Действия для работы с физическими лицами ==========
    async fetchIndividuals({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('individuals'))
        commit('SET_INDIVIDUALS', response.data)
      } catch (error) {
        console.error('Error fetching individuals:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async addIndividual({ commit, dispatch }, individual) {
      commit('SET_LOADING', true)
      try {
        const response = await api.post(collectionUrl('individuals'), {
          lastname: individual.lastname,
          firstname: individual.firstname,
          patronymic: individual.patronymic,
          position: individual.position
        })
        await dispatch('fetchIndividuals')
        return response.data
      } catch (error) {
        console.error('Error details:', {
          request: error.config?.data,
          response: error.response?.data
        })
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateIndividual({ commit, dispatch }, { _id, ...individual }) {
      commit('SET_LOADING', true)
      try {
        await api.put(collectionUrl('individuals'), {
          _id,
          lastname: individual.lastname,
          firstname: individual.firstname,
          patronymic: individual.patronymic,
          position: individual.position
        })
        await dispatch('fetchIndividuals')
      } catch (error) {
        console.error('Error updating individual:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteIndividual({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('individuals', id))
        await dispatch('fetchIndividuals')
      } catch (error) {
        console.error('Error deleting individual:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ========== Действия для работы с доверенностями ==========
    async fetchProxies({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('proxies'))
        commit('SET_PROXIES', response.data)
      } catch (error) {
        console.error('Error fetching proxies:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchProxyById({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(itemUrl('proxies', id))
        const proxy = {
          _id: response.data._id,
          number: response.data.number,
          date: response.data.date,
          organization: response.data.organization?._id || response.data.organization,
          supplier_organization: response.data.supplier_organization?._id || response.data.supplier_organization,
          individual: response.data.individual?._id || response.data.individual,
          period: response.data.period || { from: '', until: '' },
          items: response.data.items || []
        }
        commit('SET_CURRENT_PROXY', proxy)
        return proxy
      } catch (error) {
        console.error('Error fetching proxy by id:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async addProxy({ commit, dispatch }, proxy) {
      commit('SET_LOADING', true)
      try {
        const proxyData = {
          number: proxy.number,
          date: proxy.date,
          organization: proxy.organization,
          supplier_organization: proxy.supplier_organization,
          individual: proxy.individual,
          period: {
            from: proxy.period.from,
            until: proxy.period.until
          },
          items: proxy.items.map(item => ({
            item: item.item,
            count: parseInt(item.count)
          }))
        }

        const response = await api.post(collectionUrl('proxies'), proxyData)
        await dispatch('fetchProxies')
        return response.data
      } catch (error) {
        console.error('Error adding proxy:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateProxy({ commit, dispatch }, proxy) {
      commit('SET_LOADING', true)
      try {
        const proxyData = {
          _id: proxy._id,
          number: proxy.number,
          date: proxy.date,
          organization: proxy.organization,
          supplier_organization: proxy.supplier_organization,
          individual: proxy.individual,
          period: {
            from: proxy.period.from,
            until: proxy.period.until
          },
          items: proxy.items.map(item => ({
            item: item.item,
            count: parseInt(item.count)
          }))
        }

        await api.put(collectionUrl('proxies'), proxyData)
        await dispatch('fetchProxies')
      } catch (error) {
        console.error('Error updating proxy:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteProxy({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('proxies', id))
        await dispatch('fetchProxies')
      } catch (error) {
        console.error('Error deleting proxy:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ========== Действия для работы с единицами измерения ==========
    async fetchUnits({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('units'))
        commit('SET_UNITS', response.data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async addUnit({ commit, dispatch }, unit) {
      commit('SET_LOADING', true)
      try {
        await api.post(collectionUrl('units'), { title: unit.title })
        await dispatch('fetchUnits')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateUnit({ commit, dispatch }, unit) {
      commit('SET_LOADING', true)
      try {
        await api.put(collectionUrl('units'), { _id: unit._id, title: unit.title })
        await dispatch('fetchUnits')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteUnit({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('units', id))
        await dispatch('fetchUnits')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ========== Действия для работы с видами упаковки ==========
    async fetchPackageTypes({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('package-types'))
        commit('SET_PACKAGE_TYPES', response.data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async addPackageType({ commit, dispatch }, packageType) {
      commit('SET_LOADING', true)
      try {
        await api.post(collectionUrl('package-types'), { title: packageType.title })
        await dispatch('fetchPackageTypes')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updatePackageType({ commit, dispatch }, packageType) {
      commit('SET_LOADING', true)
      try {
        await api.put(collectionUrl('package-types'), { _id: packageType._id, title: packageType.title })
        await dispatch('fetchPackageTypes')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deletePackageType({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('package-types', id))
        await dispatch('fetchPackageTypes')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ========== Действия для работы с основаниями ==========
    async fetchBasisDocuments({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('basis-documents'))
        commit('SET_BASIS_DOCUMENTS', response.data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async addBasisDocument({ commit, dispatch }, basis) {
      commit('SET_LOADING', true)
      try {
        await api.post(collectionUrl('basis-documents'), { title: basis.title })
        await dispatch('fetchBasisDocuments')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateBasisDocument({ commit, dispatch }, basis) {
      commit('SET_LOADING', true)
      try {
        await api.put(collectionUrl('basis-documents'), { _id: basis._id, title: basis.title })
        await dispatch('fetchBasisDocuments')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteBasisDocument({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('basis-documents', id))
        await dispatch('fetchBasisDocuments')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ========== Действия для работы с ТОРГ-12 ==========
    async fetchTorg12({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(collectionUrl('torg12'))
        commit('SET_TORG12', response.data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchTorg12ById({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(itemUrl('torg12', id))
        commit('SET_CURRENT_TORG12', response.data)
        return response.data
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async addTorg12({ commit, dispatch }, document) {
      commit('SET_LOADING', true)
      try {
        await api.post(collectionUrl('torg12'), document)
        await dispatch('fetchTorg12')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateTorg12({ commit, dispatch }, document) {
      commit('SET_LOADING', true)
      try {
        await api.put(collectionUrl('torg12'), document)
        await dispatch('fetchTorg12')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteTorg12({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        await api.delete(itemUrl('torg12', id))
        await dispatch('fetchTorg12')
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    // Геттеры для доступа к данным состояния
    organizations: state => state.organizations,
    individuals: state => state.individuals,
    proxies: state => state.proxies,
    items: state => state.items,
    units: state => state.units,
    packageTypes: state => state.packageTypes,
    basisDocuments: state => state.basisDocuments,
    positions: state => state.positions,
    isLoading: state => state.isLoading,
    currentProxy: state => state.currentProxy,
    torg12Documents: state => state.torg12Documents,
    currentTorg12: state => state.currentTorg12,

    // Геттеры для поиска по ID
    getItemById: state => id => state.items.find(item => item._id === id),
    getPositionById: state => id => state.positions.find(pos => pos._id === id),
    getOrganizationById: state => id => state.organizations.find(org => org._id === id),
    getIndividualById: state => id => state.individuals.find(ind => ind._id === id),
    getProxyById: state => id => state.proxies.find(proxy => proxy._id === id),
    getUnitById: state => id => state.units.find(unit => unit._id === id),
    getPackageTypeById: state => id => state.packageTypes.find(pkg => pkg._id === id),
    getBasisDocumentById: state => id => state.basisDocuments.find(basis => basis._id === id),
    getTorg12ById: state => id => state.torg12Documents.find(doc => doc._id === id)
  }
})
