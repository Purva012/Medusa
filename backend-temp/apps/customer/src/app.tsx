import { useState } from "react"
import { useStorefrontHome } from "./hooks/use-storefront-home"
import { useProductSearch } from "./hooks/use-product-search"
import type { Product } from "./types/store"

function pickTag(product: Product) {
  const source = `${product.title} ${product.description ?? ""}`.toLowerCase()

  if (source.includes("vitamin")) return "Vitamins"
  if (source.includes("protein")) return "Sports"
  if (source.includes("skin")) return "Beauty"
  if (source.includes("baby")) return "Baby"

  return "Wellness"
}

export function App() {
  const [query, setQuery] = useState("")
  const { products, regions, collections, categories, loaded } = useStorefrontHome()
  const { products: visibleProducts } = useProductSearch(query, products)

  return (
    <main className="page">
      <header className="header">
        <div className="brand">iHerb style Medusa</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Simple Medusa frontend</p>
          <h1>Natural store layout powered by your Medusa APIs</h1>
          <p className="hero-text">A simple product browsing page connected to your Medusa store.</p>
        </div>
        <div className="hero-panel">
          <div className="hero-stat">
            <strong>{products.length}</strong>
            <span>catalog items</span>
          </div>
          <div className="hero-stat">
            <strong>{visibleProducts.length}</strong>
            <span>visible items</span>
          </div>
          <div className="hero-stat">
            <strong>{regions.length + collections.length + categories.length}</strong>
            <span>other API records</span>
          </div>
        </div>
      </section>

      <section className="search-row">
        <input
          className="search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
        />
      </section>

      <section className="chips" aria-label="Highlights">
        <span>{regions[0]?.name ?? "Trending now"}</span>
        <span>{collections[0]?.title ?? "Daily wellness"}</span>
        <span>{categories[0]?.name ?? "Clean beauty"}</span>
        <span>{categories[1]?.name ?? "Sports nutrition"}</span>
      </section>

      <section className="product-grid" aria-label="Products">
        {visibleProducts.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-media">
              {product.thumbnail ? <img src={product.thumbnail} alt={product.title} /> : <span>{product.title.slice(0, 1)}</span>}
            </div>
            <div className="product-body">
              <div className="product-tag">{pickTag(product)}</div>
              <h2>{product.title}</h2>
              <p>{product.description || "No product description yet."}</p>
              <a className="product-link" href={product.handle ? `#${product.handle}` : "#"}>
                View product
              </a>
            </div>
          </article>
        ))}
        {loaded && visibleProducts.length === 0 ? <div className="empty-state">No products to show yet.</div> : null}
      </section>
    </main>
  )
}
