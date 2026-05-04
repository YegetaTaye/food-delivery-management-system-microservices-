/**
 * Products Page
 *
 * Displays the product catalog from the Product Service.
 *
 * API Integration:
 * - GET /api/v1/products → Product Service
 * - Fetches all available products with name, category, price
 *
 * Flow:
 * 1. Page loads, fetches products from API Gateway
 * 2. API Gateway routes to Product Service
 * 3. Product Service returns product catalog
 * 4. Products displayed in grid layout
 * 5. User can add products to cart (frontend-only operation)
 *
 * Note: Products are READ-ONLY. No create/update/delete from frontend.
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { productsApi } from "../services/api";
import type { Product, ApiError } from "../types";

import { useSearch } from "../context/SearchContext";

export default function ProductsPage() {
  const { addToCart, items } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getProducts();
        setProducts(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category?.name === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getEmojiForCategory = (categoryName?: string) => {
    switch (categoryName) {
      case 'Burgers': return '🍔';
      case 'Pizza': return '🍕';
      case 'Sushi': return '🍣';
      case 'Salads': return '🥗';
      case 'Desserts': return '🍰';
      case 'Drinks': return '🥤';
      default: return '🍽️';
    }
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = items.find((item) => item.product.id === productId);
    return cartItem?.quantity || 0;
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner large" />
        <p>Preparing the menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="products-page customer-view">
      {/* Page Title & Category Navigation */}
      <section className="catalog-header container">
        <div className="header-flex">
          <div className="title-group">
            <h1 className="main-title">Delicious Discoveries</h1>
            <p className="subtitle">Find your favorite food from our top-rated restaurants</p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="categories-section container">
        <div className="category-scroll">
          {['All', 'Burgers', 'Pizza', 'Sushi', 'Salads', 'Desserts', 'Drinks'].map((cat) => (
            <button 
              key={cat} 
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="cat-icon">{cat === 'All' ? '✨' : getEmojiForCategory(cat)}</span>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <div className="container">
        <div className="grid-meta">
          <h3 className="results-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'dish' : 'dishes'} found
          </h3>
          <div className="filter-chip">
            Sort by: <b>Popularity</b> ▾
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-icon">🏜️</div>
            <h3>No results for "{searchQuery}"</h3>
            <p>Try searching for something else or clearing your filters.</p>
            <button className="btn btn-secondary" onClick={() => {setSearchQuery(""); setActiveCategory("All");}}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="food-grid">
            {filteredProducts.map((product) => {
              const cartQty = getCartQuantity(product.id);
              return (
                <div key={product.id} className="food-item-card glass">
                  <Link to={`/products/${product.id}`} className="card-link-wrapper">
                    <div className="card-media">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="food-img" />
                      ) : (
                        <div className="food-img-placeholder">
                          <span className="placeholder-emoji">{getEmojiForCategory(product.category?.name)}</span>
                        </div>
                      )}
                      <div className="rating-badge">⭐ 4.8</div>
                      <button 
                        className={`add-to-cart-action ${cartQty > 0 ? 'in-cart' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        title="Add to Cart"
                      >
                        {cartQty > 0 ? (
                          <span className="qty-count">{cartQty}</span>
                        ) : (
                          <span className="plus-icon">+</span>
                        )}
                      </button>
                    </div>
                    
                    <div className="card-info">
                      <div className="info-header">
                        <h4 className="item-name">{product.name}</h4>
                        <span className="item-price">${product.price.toFixed(2)}</span>
                      </div>
                      <p className="item-desc">{product.description || 'Artisanally crafted with fresh, local ingredients.'}</p>
                      <div className="item-footer">
                        <span className="tag">🚀 20-30 min</span>
                        <span className="tag">🔥 Popular</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .customer-view { padding-bottom: 5rem; }
        .container { max-width: 1440px; margin: 0 auto; padding: 0 1.5rem; }
        .card-link-wrapper { text-decoration: none; color: inherit; display: block; }
        
        /* Header & Search */
        .catalog-header { padding: 1.5rem 0 1rem; }
        .header-flex { display: flex; justify-content: space-between; align-items: center; gap: 2rem; flex-wrap: wrap; }
        .main-title { font-family: var(--font-serif); font-size: 3.5rem; font-weight: 900; letter-spacing: -1px; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.25rem; }
        .subtitle { color: #64748b; font-size: 1.1rem; font-style: italic; }
        
        .search-wrapper {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          border-radius: 18px;
          width: 100%;
          max-width: 450px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .search-icon { margin-right: 1rem; opacity: 0.5; }
        .search-input { background: transparent; border: none; color: #fff; width: 100%; font-size: 1rem; outline: none; }
        .search-input::placeholder { color: #475569; }
        
        /* Categories */
        .categories-section { margin-bottom: 2rem; }
        .category-scroll { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; scrollbar-width: none; }
        .category-scroll::-webkit-scrollbar { display: none; }
        
        .category-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          white-space: nowrap;
        }
        .category-pill:hover { background: rgba(255, 255, 255, 0.08); transform: translateY(-3px); color: #fff; }
        .category-pill.active { background: var(--accent-primary); color: #000; border-color: var(--accent-primary); box-shadow: 0 10px 25px var(--accent-glow); transform: translateY(-2px) scale(1.05); }
        .cat-icon { font-size: 1.2rem; }
        
        /* Grid & Cards */
        .grid-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .results-count { font-size: 1.25rem; font-weight: 700; color: #fff; }
        .filter-chip { padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px; font-size: 0.85rem; color: #64748b; }
        
        .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 3rem; }
        
        .food-item-card {
          border-radius: 32px;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(255, 255, 255, 0.03);
          position: relative;
        }
        .food-item-card:hover { transform: translateY(-15px) rotate(1.5deg); border-color: rgba(255, 77, 0, 0.2); box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5); }
        
        .card-media { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #0f172a; }
        .food-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease; }
        .food-item-card:hover .food-img { transform: scale(1.15); }
        
        .food-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg, #0f172a, #1e293b); }
        .placeholder-emoji { font-size: 5rem; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3)); }
        
        .rating-badge { position: absolute; top: 1.25rem; left: 1.25rem; padding: 0.5rem 1rem; background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); border-radius: 15px; font-size: 0.85rem; font-weight: 800; color: #fbbf24; border: 1px solid rgba(255, 255, 255, 0.1); }
        
        .add-to-cart-action {
          position: absolute;
          bottom: 1.25rem;
          right: 1.25rem;
          width: 52px;
          height: 52px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 18px;
          font-weight: 800;
          font-size: 1.6rem;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .add-to-cart-action:hover { transform: scale(1.2) rotate(90deg); background: var(--accent-primary); color: #fff; }
        .add-to-cart-action.in-cart { background: var(--accent-primary); color: #fff; box-shadow: 0 10px 25px var(--accent-glow); }
        .qty-count { font-size: 1.1rem; }
        
        .card-info { padding: 1.75rem; }
        .info-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .item-name { font-family: var(--font-serif); font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1.2; }
        .item-price { font-size: 1.35rem; font-weight: 900; color: var(--accent-primary); }
        .item-desc { font-size: 0.95rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .item-footer { display: flex; gap: 1rem; }
        .tag { font-size: 0.8rem; font-weight: 700; color: #64748b; background: rgba(255,255,255,0.03); padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); }
        
        /* Empty State */
        .empty-state { padding: 5rem; text-align: center; border-radius: 32px; margin-top: 2rem; }
        .empty-icon { font-size: 5rem; margin-bottom: 1.5rem; }
        .empty-state h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .empty-state p { color: #64748b; margin-bottom: 2rem; }
      `}</style>
    </div>
  );
}
