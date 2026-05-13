import { apiEndpoints } from "../config/endpoints"
import type {
  CollectionsResponse,
  ProductCategoriesResponse,
  ProductsResponse,
  RegionsResponse,
} from "../types/store"
import { getJson } from "./http"

export const storeService = {
  getProducts(signal?: AbortSignal) {
    return getJson<ProductsResponse>(apiEndpoints.store.customProducts, signal)
  },
  searchProducts(query: string, signal?: AbortSignal) {
    return getJson<ProductsResponse>(
      `${apiEndpoints.store.search}?q=${encodeURIComponent(query)}`,
      signal
    )
  },
  getRegions(signal?: AbortSignal) {
    return getJson<RegionsResponse>(apiEndpoints.store.regions, signal)
  },
  getCollections(signal?: AbortSignal) {
    return getJson<CollectionsResponse>(apiEndpoints.store.collections, signal)
  },
  getCategories(signal?: AbortSignal) {
    return getJson<ProductCategoriesResponse>(apiEndpoints.store.categories, signal)
  },
}
