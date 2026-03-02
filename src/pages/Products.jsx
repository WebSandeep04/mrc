import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SearchBanner from '../components/SearchBanner';
import { products } from '../constants/dummyData';
import '../css/Products.css';

export default function Products() {
  const navigate = useNavigate();

  return (
    <div className="mrc-products-page">
      <Header downloadAppHeader={true} />

      <SearchBanner />

      {/* Tags Section */}
      <div className="mrc-tags-section">
        <div className="tags-container">
          <span className="related-text">Related</span>
          <div className="pill-tags-list">
            <button className="pill-tag-item">Pipes</button>
            <button className="pill-tag-item">Adhesive</button>
            <button className="pill-tag-item">Tapes</button>
          </div>
        </div>
      </div>

      <div className="mrc-main-grid-container">
        {/* Sidebar */}
        <aside className="mrc-sidebar">
          <div className="filter-box">
            <div className="filter-header">
              <span className="title-bold">Filter</span>
              <button className="reset-pill">Reset</button>
            </div>

            <div className="sidebar-group">
              <div className="group-header">
                <span>Price</span>
                <div className="hide-toggle">
                  <span>Hide</span>
                  <span className="chevron-icon">⌄</span>
                </div>
              </div>
              <div className="slider-wrapper">
                <div className="custom-slider">
                  <div className="slider-track"></div>
                  <div className="slider-fill"></div>
                  <div className="slider-handle"></div>
                </div>
                <div className="max-price-label">Max. $100.00</div>
              </div>
            </div>

            <div className="sidebar-group">
              <div className="group-header">
                <span>City</span>
                <div className="hide-toggle">
                  <span>Hide</span>
                  <span className="chevron-icon">⌄</span>
                </div>
              </div>
              <div className="check-group">
                <label className="check-row"><input type="checkbox" defaultChecked /> Jakarta</label>
                <label className="check-row"><input type="checkbox" defaultChecked /> Surabaya</label>
                <label className="check-row"><input type="checkbox" /> Semarang</label>
                <label className="check-row"><input type="checkbox" /> Yogyakarta</label>
                <label className="check-row"><input type="checkbox" /> Malang</label>
              </div>
              <button className="see-all-link">See All</button>
            </div>

            <div className="sidebar-group">
              <div className="group-header">
                <span>Shipping Options</span>
                <div className="hide-toggle">
                  <span>Hide</span>
                  <span className="chevron-icon">⌄</span>
                </div>
              </div>
              <div className="check-group">
                <label className="check-row"><input type="checkbox" defaultChecked /> Regular</label>
                <label className="check-row"><input type="checkbox" defaultChecked /> Economical</label>
                <label className="check-row"><input type="checkbox" /> Same Day</label>
                <label className="check-row"><input type="checkbox" /> Express</label>
                <label className="check-row"><input type="checkbox" /> Cargo</label>
              </div>
              <button className="see-all-link">See All</button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="mrc-content-grid">
          <div className="grid-renderer">
            {products.map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>

          <div className="mrc-pagination">
            <button className="load-more-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
              <span className="load-text">Load more</span>
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}