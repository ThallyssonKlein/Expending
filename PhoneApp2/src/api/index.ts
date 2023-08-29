// apisauce

import {create} from 'apisauce';

const api = create({
  baseURL: 'https://my-expending-project.rj.r.appspot.com',
  timeout: 469000
});

export interface IOption {
  hasDefault: boolean;
  defaultValue: number;
  nameInApp: string;
  path: string;
}

export async function getOptions() {
  const response = await api.get<IOption[]>('/options');
  
  if (response.status == 200) {
    return response.data;
  }

  return []
}

export async function post(path: string, body: any) {
  const response = await api.post(path, body);

  if (response.status == 200) {
    return response.data;
  }

  return null;
}

export default api;
