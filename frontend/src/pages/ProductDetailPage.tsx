import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productsApi } from "../services/api";
import { useCart } from "../context/CartContext";
import type { Product, ApiError } from "../types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productsApi.getProducts();
        const found = data.find((p: Product) => p.id === id);
        if (found) {
          setProduct(found);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const cartItem = items.find((item) => item.product.id === id);
  const cartQty = cartItem?.quantity || 0;

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner large" />
        <p>Fetching flavor details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-error">
        <div className="error-icon">🔍</div>
        <h2>Product not found</h2>
        <p>The dish you're looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/products" className="btn btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page container fade-in">
      <div className="back-nav">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back to Menu
        </button>
      </div>

      <div className="detail-layout">
        <div className="detail-media glass">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="detail-img" />
          ) : (
            <div className="detail-img-placeholder">
               <span className="placeholder-emoji">🍽️</span>
            </div>
          )}
          <div className="media-overlay">
            <span className="badge-premium">⭐ 4.9 (2k+ reviews)</span>
          </div>
        </div>

        <div className="detail-content">
          <div className="content-header">
            <span className="category-tag">{product.category?.name}</span>
            <h1 className="detail-title">{product.name}</h1>
            <div className="price-tag">${product.price.toFixed(2)}</div>
          </div>

          <div className="detail-description">
            <h3>Description</h3>
            <p>{product.description || "Indulge in our signature dish, meticulously prepared using only the finest locally-sourced ingredients. A perfect balance of textures and flavors that promises a gourmet experience in every bite."}</p>
          </div>

          <div className="detail-meta-grid">
            <div className="meta-card glass">
              <span className="meta-icon">🕒</span>
              <div className="meta-text">
                <span className="meta-label">Time</span>
                <span className="meta-value">20-30 min</span>
              </div>
            </div>
            <div className="meta-card glass">
              <span className="meta-icon">🔥</span>
              <div className="meta-text">
                <span className="meta-label">Calories</span>
                <span className="meta-value">450 kcal</span>
              </div>
            </div>
            <div className="meta-card glass">
              <span className="meta-icon">🌱</span>
              <div className="meta-text">
                <span className="meta-label">Ingredients</span>
                <span className="meta-value">Fresh & Organic</span>
              </div>
            </div>
          </div>

          <div className="detail-actions">
            <div className="qty-control glass">
               <button className="qty-btn" onClick={() => addToCart(product)}>+</button>
               <span className="qty-display">{cartQty} in cart</span>
            </div>
            <button 
              className={`btn btn-primary btn-lg btn-add-full ${cartQty > 0 ? 'active' : ''}`}
              onClick={() => addToCart(product)}
            >
              {cartQty > 0 ? 'Add More to Cart' : 'Add to Cart'}
            </button>
          </div>
          
          <div className="detail-delivery-info">
             <p>🚀 Free delivery on orders over $50</p>
             <p>✨ 100% Satisfaction Guaranteed</p>
          </div>
        </div>
      </div>

      <style>{`
        .product-detail-page { padding: 2rem 0; }
        .back-nav { margin-bottom: 2rem; }
        .btn-back { background: transparent; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; transition: color 0.2s; }
        .btn-back:hover { color: #fff; }

        .detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
        @media (max-width: 968px) { .detail-layout { grid-template-columns: 1fr; gap: 2rem; } }

        .detail-media { border-radius: 32px; overflow: hidden; position: relative; aspect-ratio: 1/1; border: 1px solid rgba(255, 255, 255, 0.05); }
        .detail-img { width: 100%; height: 100%; object-fit: cover; }
        .detail-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #12121a; }
        .placeholder-emoji { font-size: 8rem; }
        
        .media-overlay { position: absolute; top: 1.5rem; left: 1.5rem; }
        .badge-premium { background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); padding: 0.5rem 1rem; border-radius: 99px; font-weight: 700; font-size: 0.85rem; color: #fbbf24; }

        .category-tag { color: var(--accent-primary); font-family: var(--font-sans); font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem; display: block; margin-bottom: 0.75rem; }
        .detail-title { font-family: var(--font-serif); font-size: 4.5rem; font-weight: 900; line-height: 1; margin-bottom: 1.5rem; letter-spacing: -2px; }
        .price-tag { font-family: var(--font-serif); font-size: 3rem; font-weight: 900; color: var(--accent-primary); margin-bottom: 2.5rem; }

        .detail-description h3 { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .detail-description p { color: #94a3b8; line-height: 1.7; margin-bottom: 3rem; font-size: 1.15rem; }

        .detail-meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3.5rem; }
        .meta-card { padding: 1.5rem; border-radius: 24px; display: flex; align-items: center; gap: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.03); transition: transform 0.3s ease; }
        .meta-card:hover { transform: translateY(-5px) skewX(-1deg); background: rgba(255,255,255,0.02); }
        .meta-icon { font-size: 1.75rem; }
        .meta-label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .meta-value { font-weight: 800; color: #fff; font-size: 1.1rem; }

        .detail-actions { display: flex; gap: 2rem; align-items: center; margin-bottom: 2.5rem; }
        .qty-control { display: flex; align-items: center; gap: 1.5rem; padding: 0.75rem 2rem; border-radius: 22px; border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(255,255,255,0.02); }
        .qty-btn { background: transparent; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; transition: transform 0.2s; }
        .qty-btn:hover { transform: scale(1.2) rotate(15deg); color: var(--accent-primary); }
        .qty-display { font-weight: 800; white-space: nowrap; font-size: 1.1rem; }
        .btn-add-full { flex: 1; height: 70px; font-weight: 900; font-size: 1.25rem; border-radius: 24px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .btn-add-full:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 15px 30px var(--accent-glow); }
        .btn-add-full.active { background: #fff; color: #000; }

        .detail-delivery-info { padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .detail-delivery-info p { color: #64748b; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; }
      `}</style>
    </div>
  );
}
