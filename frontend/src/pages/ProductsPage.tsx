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
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { productsApi } from "../services/api";
import type { Product, ApiError } from "../types";

export default function ProductsPage() {
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Call Product Service via API Gateway
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

  // Get quantity of product in cart
  const getCartQuantity = (productId: string) => {
    const cartItem = items.find((item) => item.product.id === productId);
    return cartItem?.quantity || 0;
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Menu</h1>
        <p className="page-description">Browse our delicious offerings</p>
      </div>

      {/* Service indicator */}
      <div className="service-indicator">
        <span className="service-badge">Product Service</span>
        <span className="endpoint-badge">GET /api/v1/products</span>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products available</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => {
            const cartQty = getCartQuantity(product.id);
            return (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="product-image-placeholder">
                      <span>🍽️</span>
                    </div>
                  )}
                </div>
                <div className="product-content">
                  <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    {product.category && (
                      <span className="product-category">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                  {product.description && (
                    <p className="product-description">{product.description}</p>
                  )}
                  <div className="product-footer">
                    <span className="product-price">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn btn-primary btn-sm"
                    >
                      {cartQty > 0 ? `Add More (${cartQty})` : "Add to Cart"}
                    </button>
                  </div>
                  {product.stock !== undefined && product.stock <= 5 && (
                    <span className="stock-warning">
                      Only {product.stock} left!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Summary */}
      {items.length > 0 && (
        <div className="floating-cart-summary">
          <span>
            {items.reduce((sum, item) => sum + item.quantity, 0)} items in cart
          </span>
          <a href="/cart" className="btn btn-secondary">
            View Cart
          </a>
        </div>
      )}
    </div>
  );
}
