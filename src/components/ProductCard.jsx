import { useNavigate } from "react-router-dom";

export default function ProductCard({
  product,
  isPopular = false,
  showStock = true,
  showHeart = false
}) {
  const navigate = useNavigate();

  return (
    <div className="mrc-card" onClick={() => navigate('/product-details')}>
      <div className="card-media">
        <img src={product.image || "/pipes.jpg"} alt={product.name} />

        {isPopular && (
          <div className="popular-badge-card">Popular</div>
        )}

        {showHeart && (
          <div className="heart-icon-card">♡</div>
        )}

        {showStock && (
          <div className="stock-tag">Available in stock</div>
        )}

        {product.discount && !showStock && (
          <div className="discount-tag-card">40% off</div>
        )}
      </div>
      <div className="card-details">
        <h4 className="p-name">{product.name || "Product"}</h4>
        <p className="p-brand">{product.brand || "About"}</p>
        {!showHeart && (
          <div className="p-price-row">
            <span className="p-curr">₹{product.price}</span>
            <span className="p-disc">{product.discount}</span>
            <span className="p-old">₹{product.oldPrice}</span>
          </div>
        )}
      </div>
    </div>
  );
}
