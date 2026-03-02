import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBanner from '../components/SearchBanner';
import { productDetails } from '../constants/dummyData';
import '../css/productDetails.css';

export default function ProductDetails() {
  return (
    <div className="product-details-page">
      <Header downloadAppHeader={true} />
      <SearchBanner />

      <div className="breadcrumb-nav">
        Home / Products / <span>CPVC Pipes</span>
      </div>

      <main className="details-container">
        {/* Left: Product Image */}
        <div className="product-visual">
          <div className="main-img-card">
            <span className="popular-badge">Popular</span>
            <img src="/pipes.jpg" alt="CPVC Pipes" />
          </div>
        </div>

        {/* Right: Selection Logic */}
        <div className="product-selection">
          <p className="brand-label">{productDetails.description}</p>
          <h1>{productDetails.name}</h1>
          <div className="price-tag-row">
            <span className="current-p">₹{productDetails.currentPrice}</span>
            <span className="disc-p">{productDetails.discount}</span>
            <span className="old-p">₹{productDetails.oldPrice}</span>
          </div>

          <div className="variant-picker">
            <p>Pick Weighs</p>
            <div className="weight-options">
              {productDetails.weights.map((w, i) => (
                <button key={i} className={`weight-btn ${i === 1 ? 'active' : ''}`}>{w}</button>
              ))}
            </div>
          </div>

          <div className="action-row">
            <div className="qty-stepper">
              <button>-</button>
              <span>1</span>
              <button>+</button>
            </div>
            <button className="buy-now">Buy Now</button>
            <button className="add-to-cart">Add to cart</button>
          </div>
        </div>
      </main>

      {/* Specification Section */}
      <section className="specs-section">
        <div className="tabs">
          <span className="tab active">Specification</span>
          <span className="tab">Description</span>
        </div>

        <div className="specs-grid">
          <div className="specs-table">
            {productDetails.specifications.map((spec, i) => (
              <div key={i} className="spec-row">
                <span className="spec-key">{spec.key}</span>
                <span className="spec-val">{spec.val}</span>
              </div>
            ))}
          </div>

          <div className="floating-price-card">
            <h4 className="float-title">CPVC Pipes - 1.5”</h4>
            <div className="float-price-row">
              <h2 className="float-price">₹99.000</h2>
              <div className="float-qty-stepper">
                <button className="qty-btn-minus">−</button>
                <span className="qty-count">1</span>
                <button className="qty-btn-plus">+</button>
              </div>
            </div>
            <button className="float-buy-btn">Buy Now</button>
            <button className="float-cart-btn">Add to cart</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}