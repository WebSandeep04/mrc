import '../css/SearchBanner.css';

export default function SearchBanner() {
    return (
        <div className="mrc-search-container">
            <div className="mrc-blue-banner"></div>
            <div className="mrc-search-bar-wrapper">
                <div className="search-box-pill">
                    <div className="search-input-group">
                        <span className="search-icon-glass">🔍</span>
                        <input type="text" placeholder="Search..." className="main-search-input" />
                    </div>
                    <div className="search-actions-group">
                        <div className="clear-action">
                            <div className="blue-close-circle">
                                <span>×</span>
                            </div>
                        </div>
                        <div className="search-divider-line"></div>
                        <div className="category-trigger">
                            <span className="cat-text">Category</span>
                            <span className="cat-chevron">⌄</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
