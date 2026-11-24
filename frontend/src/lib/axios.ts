import Axios from 'axios';
import envConfig from '../environment/index';

const API_URL = `${envConfig.apiUrl}`;

function createHeaders() {
  const token = localStorage.getItem('token') || 'null';

  const headers: any = {
    Accept: 'application/json',
  };

  // Only set Content-Type for non-FormData requests
  // FormData requests should let the browser set Content-Type with boundary
  if (token && token !== 'null') {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}

export const apiAxios = Axios.create({
  baseURL: API_URL,
  headers: createHeaders(),
});

apiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || 'null';
    config.headers.set('Accept', 'application/json');
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    // FormData will be detected automatically by axios
    if (!(config.data instanceof FormData)) {
      config.headers.set('Content-Type', 'application/json');
    }

    if (token && token !== 'null') {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


