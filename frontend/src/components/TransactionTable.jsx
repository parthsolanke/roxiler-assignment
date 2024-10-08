// src/components/TransactionTable.jsx
import { useState, useEffect } from 'react';
import { fetchTransactions } from '../api';
import TransactionStatistics from './TransactionStatistics';
import BarChart from './BarChart';
import { months } from '../constants';

const TransactionTable = () => {
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth, searchTerm, currentPage]);

  const loadTransactions = async () => {
    try {
      const data = await fetchTransactions(selectedMonth, searchTerm, currentPage);
      setTransactions(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="transaction-table">
      <div className="controls">
        <label htmlFor="month-select">Select Month: </label>
        <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <TransactionStatistics selectedMonth={selectedMonth} />

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>
                <td>{transaction.category}</td>
                <td>{transaction.sold ? 'Yes' : 'No'}</td>
                <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <BarChart selectedMonth={selectedMonth} />
    </div>
  );
};

export default TransactionTable;
