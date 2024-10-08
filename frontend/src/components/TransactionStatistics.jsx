// src/components/TransactionStatistics.jsx
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchStatistics } from '../api';
import { months } from '../constants';

const TransactionStatistics = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({
    totalAmount: 0.0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const data = await fetchStatistics(selectedMonth);
        setStatistics({
          totalAmount: data.totalSaleAmount || 0,
          totalSoldItems: data.soldItems || 0,
          totalNotSoldItems: data.notSoldItems || 0,
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    loadStatistics();
  }, [selectedMonth]);

  const monthName = months.find(month => month.value === selectedMonth)?.label || 'Unknown';

  return (
    <div className="statistics">
      <h2>Statistics for {monthName}</h2>
      <div className="statistic-item">
        <strong>Total Amount of Sales:</strong> {statistics.totalAmount.toFixed(2)}
      </div>
      <div className="statistic-item">
        <strong>Total Sold Items:</strong> {statistics.totalSoldItems}
      </div>
      <div className="statistic-item">
        <strong>Total Not Sold Items:</strong> {statistics.totalNotSoldItems}
      </div>
    </div>
  );
};


TransactionStatistics.propTypes = {
  selectedMonth: PropTypes.number.isRequired,
};

export default TransactionStatistics;
