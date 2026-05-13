import { useEffect, useState } from "react"
import { storeService } from "../services/store-service"
import type { Product } from "../types/store"

type ProductSearchState = {
  products: Product[]
  source: string | null
}

export function useProductSearch(query: string, initialProducts: Product[]) {
  const [state, setState] = useState<ProductSearchState>({
    products: initialProducts,
    source: null,
  })

  useEffect(() => {
    setState((current) => ({
      ...current,
      products: initialProducts,
    }))
  }, [initialProducts])

  useEffect(() => {
    const controller = new AbortController()
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setState({
        products: initialProducts,
        source: null,
      })
      return () => controller.abort()
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await storeService.searchProducts(trimmedQuery, controller.signal)

        if (controller.signal.aborted) {
          return
        }

        setState({
          products: data.products ?? [],
          source: data.source ?? null,
        })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setState({
          products: [],
          source: null,
        })
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [initialProducts, query])

  return state
}
