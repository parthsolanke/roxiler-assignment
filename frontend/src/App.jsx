import { useState, useEffect } from 'react';
import TransactionTable from './components/TransactionTable';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <header>
        <h1>Transaction Dashboard</h1>
        <button onClick={toggleDarkMode} className="theme-toggle-btn">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>
      <TransactionTable />
    </div>
  );
};

export default App;
