import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import testRecords from '../data/test_records.json';
import './DataDisplay.css';

function DataDisplay() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState(testRecords);
  const recordsPerPage = 10;

  // Keyword search function
  const performKeywordSearch = (query) => {
    if (!query.trim()) {
      setFilteredRecords(testRecords);
      return;
    }

    const keywords = query.toLowerCase().split(' ').filter(k => k.length > 0);
    const results = testRecords.filter(record => {
      const searchText = [
        record.OracleSchema,
        record.Tables,
        record.ColumName,
        record.DataType,
        record.OracleComments,
        record.AI_Commnet,
        record.AnalystComment
      ].join(' ').toLowerCase();

      return keywords.some(keyword => searchText.includes(keyword));
    });

    setFilteredRecords(results);
    setCurrentPage(1);
  };

  // AI search function (placeholder for API integration)
  const performAISearch = async (query) => {
    if (!query.trim()) {
      setFilteredRecords(testRecords);
      return;
    }

    setIsSearching(true);
    try {
      // For now, use enhanced keyword search with natural language processing
      // In production, you would call an AI API here
      const keywords = extractKeywords(query);
      const results = testRecords.filter(record => {
        const searchText = [
          record.OracleSchema,
          record.Tables,
          record.ColumName,
          record.DataType,
          record.OracleComments,
          record.AI_Commnet,
          record.AnalystComment
        ].join(' ').toLowerCase();

        let score = 0;
        keywords.forEach(keyword => {
          if (searchText.includes(keyword)) score++;
        });

        return score > 0;
      });

      // Sort by relevance
      results.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, keywords);
        const scoreB = calculateRelevanceScore(b, keywords);
        return scoreB - scoreA;
      });

      setFilteredRecords(results);
      setCurrentPage(1);
    } catch (error) {
      console.error('Search error:', error);
      performKeywordSearch(query);
    } finally {
      setIsSearching(false);
    }
  };

  // Extract keywords from natural language query
  const extractKeywords = (query) => {
    const stopWords = ['show', 'me', 'find', 'get', 'what', 'is', 'are', 'the', 'a', 'an', 'in', 'on', 'for', 'with', 'related', 'to'];
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  };

  // Calculate relevance score for AI search
  const calculateRelevanceScore = (record, keywords) => {
    let score = 0;
    const fields = {
      ColumName: 5,
      Tables: 4,
      OracleComments: 3,
      AI_Commnet: 3,
      AnalystComment: 2,
      OracleSchema: 2,
      DataType: 1
    };

    Object.entries(fields).forEach(([field, weight]) => {
      const fieldValue = (record[field] || '').toLowerCase();
      keywords.forEach(keyword => {
        if (fieldValue.includes(keyword)) {
          score += weight;
        }
      });
    });

    return score;
  };

  // Handle search
  const handleSearch = () => {
    if (useAI) {
      performAISearch(searchQuery);
    } else {
      performKeywordSearch(searchQuery);
    }
  };

  // Reset search when query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecords(testRecords);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="data-display-container">
      <header className="data-header">
        <div className="header-content">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Database Schema Records</h1>
          <p className="record-count">
            Showing {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records
            {searchQuery && ` (filtered from ${testRecords.length} total)`}
          </p>
        </div>
      </header>

      <div className="search-section">
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Ask in natural language: e.g., 'show me employee related fields' or 'find transaction columns'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? '🔍 Searching...' : '🔍 Search'}
            </button>
            {searchQuery && (
              <button
                className="clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setFilteredRecords(testRecords);
                  setCurrentPage(1);
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
          <div className="search-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              <span className="toggle-text">
                {useAI ? '🤖 AI Search (Smart)' : '⚡ Keyword Search (Fast)'}
              </span>
            </label>
            <span className="search-hint">
              {useAI
                ? 'AI understands context and meaning'
                : 'Searches for exact keyword matches'}
            </span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Schema</th>
              <th>Table</th>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Length</th>
              <th>Oracle Comments</th>
              <th>AI Insight</th>
              <th>Analyst Note</th>
              <th>Updated By</th>
              <th>Update Date</th>
              <th>Approved By</th>
              <th>Approved Date</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.OracleSchema}</td>
                <td>{record.Tables}</td>
                <td className="column-name">{record.ColumName}</td>
                <td>{record.DataType}</td>
                <td>{record.length || '-'}</td>
                <td>{record.OracleComments}</td>
                <td className="ai-comment">{record.AI_Commnet}</td>
                <td className="analyst-comment">{record.AnalystComment}</td>
                <td>{record.updatedBy}</td>
                <td>{record.UpdateDate}</td>
                <td>{record.ApprovedBy}</td>
                <td>{record.ApprovedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Previous
        </button>

        <div className="page-numbers">
          {getPageNumbers().map((pageNumber, index) => (
            pageNumber === '...' ? (
              <span key={`ellipsis-${index}`} className="ellipsis">...</span>
            ) : (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
              >
                {pageNumber}
              </button>
            )
          ))}
        </div>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default DataDisplay;
