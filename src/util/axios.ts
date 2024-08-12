import axios from 'axios';

const BASE_URL_API = 'http://localhost:3001/mark-right/api/v1/';

/**
 * @param url
 * @param params
 * @param config
 */
export const axiosAPI = (url: string, params: any, config?: any) => {
  return axios.create({ baseURL: BASE_URL_API }).post(url, { ...params }, config);
};
