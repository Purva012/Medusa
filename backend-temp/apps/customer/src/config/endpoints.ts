const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

export const apiBaseUrl = backendUrl

export const apiEndpoints = {
  store: {
    products: "/store/products",
    customProducts: "/store/custom",
    search: "/store/search",
    regions: "/store/regions",
    collections: "/store/collections",
    categories: "/store/product-categories",
    carts: "/store/carts",
  },
} as const
