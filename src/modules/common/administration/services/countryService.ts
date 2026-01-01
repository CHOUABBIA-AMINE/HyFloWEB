/**
 * Country Service
 * @author CHOUABBIA Amine
 * @created 12-30-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { CountryDTO } from '../dto';

const BASE_URL = '/common/administration/country';

export const countryService = {
  getAllList: async (): Promise<CountryDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/list`);
    return response.data;
  },

  getById: async (id: number): Promise<CountryDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },
};
