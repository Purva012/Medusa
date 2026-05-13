import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type ProductRecord = {
  id: string
  title: string
  handle?: string | null
  description?: string | null
  thumbnail?: string | null
  status?: string
}

function normalizeProduct(product: ProductRecord) {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle ?? undefined,
    description: product.description ?? undefined,
    thumbnail: product.thumbnail ?? undefined,
  }
}

function getSearchText(req: MedusaRequest) {
  const value = req.query.q
  return typeof value === "string" ? value.trim() : ""
}

function splitSearchTerms(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function getEditDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  const current = Array.from({ length: right.length + 1 }, () => 0)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    current[0] = leftIndex

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + cost
      )
    }

    previous.splice(0, previous.length, ...current)
  }

  return previous[right.length]
}

function isFuzzyMatch(searchText: string, product: ProductRecord) {
  const haystack = `${product.title} ${product.description ?? ""} ${product.handle ?? ""}`.toLowerCase()

  if (haystack.includes(searchText.toLowerCase())) {
    return true
  }

  const searchTerms = splitSearchTerms(searchText)
  const productTerms = splitSearchTerms(haystack)

  return searchTerms.every((searchTerm) => {
    const maxDistance = searchTerm.length <= 4 ? 1 : 2

    return productTerms.some((productTerm) => {
      if (productTerm.length < 3) {
        return false
      }

      if (productTerm.includes(searchTerm)) {
        return true
      }

      if (searchTerm.length >= 3 && searchTerm.includes(productTerm)) {
        return true
      }

      return getEditDistance(searchTerm, productTerm) <= maxDistance
    })
  })
}

async function searchProductsInElastic(searchText: string) {
  const elasticUrl = process.env.ELASTICSEARCH_URL
  const elasticIndex = process.env.ELASTICSEARCH_INDEX || "medusa-products"

  if (!elasticUrl || !searchText) {
    return null
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (process.env.ELASTICSEARCH_API_KEY) {
    headers.Authorization = `ApiKey ${process.env.ELASTICSEARCH_API_KEY}`
  } else if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
    const token = Buffer.from(
      `${process.env.ELASTICSEARCH_USERNAME}:${process.env.ELASTICSEARCH_PASSWORD}`
    ).toString("base64")
    headers.Authorization = `Basic ${token}`
  }

  const response = await fetch(`${elasticUrl.replace(/\/$/, "")}/${elasticIndex}/_search`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      size: 24,
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: searchText,
                fields: ["title^4", "handle^3", "description"],
                fuzziness: "AUTO",
                prefix_length: 1,
              },
            },
            {
              multi_match: {
                query: searchText,
                type: "phrase_prefix",
                fields: ["title^3", "handle^2"],
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Elasticsearch request failed: ${response.status}`)
  }

  const payload = (await response.json()) as {
    hits?: {
      hits?: Array<{
        _source?: ProductRecord
      }>
    }
  }

  return (payload.hits?.hits ?? [])
    .map((item) => item._source)
    .filter((item): item is ProductRecord => Boolean(item?.id && item.title))
    .map(normalizeProduct)
}

async function searchProductsInMedusa(req: MedusaRequest, searchText: string) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "description", "thumbnail", "status"],
    filters: {
      status: "published",
    },
  })

  const normalizedProducts = (products as ProductRecord[]).map(normalizeProduct)

  if (!searchText) {
    return normalizedProducts
  }

  return normalizedProducts.filter((product) => isFuzzyMatch(searchText, product))
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const searchText = getSearchText(req)

  try {
    const elasticProducts = await searchProductsInElastic(searchText)

    if (elasticProducts) {
      res.json({ products: elasticProducts, source: "elasticsearch" })
      return
    }
  } catch (error) {
    console.error("Elasticsearch search failed, falling back to Medusa query.", error)
  }

  const products = await searchProductsInMedusa(req, searchText)
  res.json({ products, source: "medusa" })
}
