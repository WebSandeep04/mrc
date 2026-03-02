import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { categories, brands, products as homeProducts } from '../constants/dummyData';
import '../css/Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Header downloadAppHeader={false} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Your One-Stop Destination<br />for Hardware Solutions</h1>
          <p className="hero-subtitle">Premium Adhesives, Plumbing Solutions &<br />Industrial Supplies</p>

          <button className="explore-pill-btn" onClick={() => navigate('/products')}>
            Explore <span>›</span>
          </button>

          <div className="hero-footer-text">
            Multiple Brands • Wholesale Pricing • Reliable Supply
          </div>

          <div className="hero-indicators-box">
            <span className="hero-bar active"></span>
            <span className="hero-bar"></span>
            <span className="hero-bar"></span>
          </div>
        </div>

        <div className="hero-bg-visual">
          <img src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop" alt="Pipes" />
          <div className="hero-gradient-overlay"></div>
        </div>
      </section>

      <div className="blue-identity-bar">
        <div className="identity-item">Adhesives</div>
        <span className="identity-dot">•</span>
        <div className="identity-item">Plumbing Solutions</div>
        <span className="identity-dot">•</span>
        <div className="identity-item">Pipes & Fittings</div>
        <span className="identity-dot">•</span>
      </div>

      {/* Categories Section */}
      <section className="looking-section">
        <div className="looking-header">
          <div className="left-title">
            <h2>What are you <br /><span>looking</span> for ?</h2>
          </div>
          <div className="right-desc">
            <p>Explore our wide range of adhesives, plumbing solutions, and hardware products from trusted brands —</p>
          </div>
        </div>

        <div className="category-row">
          {categories.map((cat, i) => (
            <div key={i} className="cat-card">
              <div className="cat-img">
                <img src={cat.img} alt={cat.title} />
              </div>
              <div className="cat-label">
                <span>{cat.title}</span>
                <span className="cat-arrow">↗</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="trust-inner">
          <span className="trust-tag">Trusted Solutions</span>
          <h2>Reliable <span>Products</span>, <br />Proven <span>Performance</span></h2>
          <p className="trust-desc">From high-performance adhesives to complete plumbing solutions, we supply products that deliver consistency, strength, and reliability.</p>
        </div>
      </section>
      <div className="brand-strip">
        {brands.map((brand, i) => (
          <div key={i} className="brand-logo-box">
            <img src={brand.logo} alt={brand.name} />
          </div>
        ))}
      </div>
      <div className="brand-progress-container">
        <div className="brand-progress-bar"></div>
      </div>

      {/* Products Section */}
      <section className="all-products-section">
        <h2 className="section-title">All <span>Products</span></h2>
        <div className="product-filter-bar">
          <div className="p-search">
            <input type="text" placeholder="Search" />
            <span className="search-icon">🔍</span>
          </div>
          <div className="p-tabs">
            <button className="p-tab active">Most Popular</button>
            <button className="p-tab">Bathing</button>
            <button className="p-tab">Sanatary</button>
          </div>
        </div>


        <div className="product-grid-main">
          {homeProducts.slice(0, 8).map((p, i) => (
            <ProductCard
              key={i}
              product={p}
              isPopular={true}
              showStock={false}
              showHeart={true}
            />
          ))}
        </div>

        <button className="view-all-btn" onClick={() => navigate('/products')}>View All Products</button>
      </section>
      <Footer />
    </div>
  );
}