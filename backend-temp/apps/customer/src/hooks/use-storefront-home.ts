import { useEffect, useState } from "react"
import { storeService } from "../services/store-service"
import type { Collection, Product, ProductCategory, Region } from "../types/store"

type StorefrontHomeData = {
  products: Product[]
  regions: Region[]
  collections: Collection[]
  categories: ProductCategory[]
  loaded: boolean
}

export function useStorefrontHome() {
  const [state, setState] = useState<StorefrontHomeData>({
    products: [],
    regions: [],
    collections: [],
    categories: [],
    loaded: false,
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadStorefront() {
      const [productsResult, regionsResult, collectionsResult, categoriesResult] = await Promise.allSettled([
        storeService.getProducts(controller.signal),
        storeService.getRegions(controller.signal),
        storeService.getCollections(controller.signal),
        storeService.getCategories(controller.signal),
      ])

      if (controller.signal.aborted) {
        return
      }

      setState({
        products: productsResult.status === "fulfilled" ? (productsResult.value.products ?? []) : [],
        regions: regionsResult.status === "fulfilled" ? (regionsResult.value.regions ?? []) : [],
        collections: collectionsResult.status === "fulfilled" ? (collectionsResult.value.collections ?? []) : [],
        categories:
          categoriesResult.status === "fulfilled"
            ? (categoriesResult.value.product_categories ?? [])
            : [],
        loaded: true,
      })
    }

    loadStorefront()

    return () => controller.abort()
  }, [])

  return state
}
