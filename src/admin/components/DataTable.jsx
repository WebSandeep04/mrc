import React, { useState } from 'react';

const DataTable = ({
    headers = [],
    data = [],
    totalItems = 0,
    itemsPerPage = 10,
    loading = false,
    onAdd,
    onEdit,
    onDelete,
    onPageChange
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Calculate current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            if (onPageChange) onPageChange(newPage);
        }
    };

    return (
        <div className="admin-table-container">
            <div className="table-header-actions">
                <button className="btn-add" onClick={onAdd}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New
                </button>
            </div>

            <div className="table-responsive">
                <table className="admin-data-table">
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index}>{header.label}</th>
                            ))}
                            <th className="actions-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={headers.length + 1} className="text-center" style={{ padding: '80px 0' }}>
                                    <div className="admin-loader-container" style={{ minHeight: 'auto' }}>
                                        <div className="admin-loader"></div>
                                        <div className="admin-loader-text">Loading Data...</div>
                                    </div>
                                </td>
                            </tr>
                        ) : currentItems.length > 0 ? (
                            currentItems.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {headers.map((header, colIndex) => (
                                        <td key={colIndex}>
                                            {header.render ? header.render(row[header.key], row) : row[header.key]}
                                        </td>
                                    ))}
                                    <td className="actions-cell">
                                        <button className="action-btn edit-btn" title="Edit" onClick={() => onEdit(row)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button className="action-btn delete-btn" title="Delete" onClick={() => onDelete(row)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length + 1} className="empty-state">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="admin-pagination">
                <div className="pagination-info">
                    {totalItems > 0 ? (
                        <>
                            Showing <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</strong> to
                            <strong> {Math.min(currentPage * itemsPerPage, totalItems)}</strong> of
                            <strong> {totalItems}</strong> entries
                            <span className="page-count-badge">{totalPages} {totalPages === 1 ? 'Page' : 'Pages'} Total</span>
                        </>
                    ) : (
                        'No entries to show'
                    )}
                </div>
                <div className="pagination-controls">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="pagination-btn"
                        title="Previous Page"
                    >
                        Previous
                    </button>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="pagination-btn"
                        title="Next Page"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
