import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/Cart.css';

export default function Cart() {
  const items = [
    { id: 1, name: 'PVC Pressure Pipe – 2 inch (6m Length)', desc: 'Class C • ISI Certified', price: 450.00 },
    { id: 2, name: 'Industrial Ball Valve – 1.5 Inch', desc: 'Heavy Duty • Brass', price: 450.00 },
    { id: 3, name: 'Solvent Cement Adhesive – 500ml', desc: 'High Strength • Fast Bond', price: 450.00 }
  ];

  return (
    <div className="cart-page">
      <Header downloadAppHeader={true} />
      <main className="cart-wrapper">
        <div className="cart-header">
          <h2>My Shopping Cart</h2>
          <button className="remove-all">Remove all</button>
        </div>
        <div className="cart-content-grid">
          <div className="items-list">
            <div className="labels">
              <span>Product</span>
              <span className="l-qty">Quantity</span>
              <span className="l-price">Price</span>
            </div>
            {items.map(item => (
              <div key={item.id} className="item-row">
                <div className="p-info">
                  <input type="checkbox" defaultChecked />
                  <div className="p-thumb"></div>
                  <div className="p-text">
                    <h4>{item.name}</h4>
                    <p>{item.desc}</p>
                    <button className="remove-item">Remove</button>
                  </div>
                </div>
                <div className="p-qty">
                  <div className="qty-pill">
                    <button>-</button> <span>1</span> <button>+</button>
                  </div>
                </div>
                <div className="p-price">₹{item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <aside className="checkout-card">
            <div className="sum-row"><span>Subtotal</span><span>₹450.00</span></div>
            <div className="sum-row"><span>Tax</span><span>₹40.00</span></div>
            <div className="sum-row total"><span>Total</span><span>₹450.00</span></div>
            <button className="btn-checkout">Check Out Now</button>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}