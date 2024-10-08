// src/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchTransactions = async (month, search = '', page = 1, perPage = 5) => {
  const response = await axios.get(`${BASE_URL}/list`, {
    params: { month, search, page, perPage },
  });
  return response.data;
};

export const fetchStatistics = async (month) => {
  const response = await axios.get(`${BASE_URL}/statistics`, {
    params: { month },
  });
  return response.data;
};

export const fetchBarChartData = async (month) => {
  const response = await axios.get(`${BASE_URL}/barchart`, {
    params: { month },
  });
  return response.data;
};
