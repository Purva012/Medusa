export type Product = {
  id: string
  title: string
  handle?: string
  thumbnail?: string | null
  description?: string | null
}

export type Region = {
  id: string
  name: string
  currency_code?: string
}

export type Collection = {
  id: string
  title: string
  handle?: string
}

export type ProductCategory = {
  id: string
  name: string
  handle?: string
}

export type ProductsResponse = {
  products?: Product[]
  source?: string
}

export type RegionsResponse = {
  regions?: Region[]
}

export type CollectionsResponse = {
  collections?: Collection[]
}

export type ProductCategoriesResponse = {
  product_categories?: ProductCategory[]
}
