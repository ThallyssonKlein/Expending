// apisauce

import { create } from 'apisauce'

const api = create({
  baseURL: 'https://my-expending-project.rj.r.appspot.com',
  timeout: 469000
})

export interface IOption {
  hasDefault: boolean
  defaultValue: number
  nameInApp: string
  path: string
}

export async function getOptions (selectedMode: string): Promise<IOption[]> {
  const response = await api.get<IOption[]>(selectedMode === 'compulsions' ? '/options_v1' : '/options_v2')

  if (((response?.data) != null) && response.status === 200) {
    return response.data
  }

  return []
}

export async function post (path: string, body: any) {
  const response = await api.post(path, body)

  if (response.status == 200) {
    return response.data
  }

  return null
}

export interface SalaryUsageDetails {
  whatWillBeLeft?: number
  whatWillBeLeftWithoutCompulsions?: number
  currentSalaryUsePercentage?: number
}

export async function getSalaryDetails (): Promise<SalaryUsageDetails | null> {
  try {
    const response = await api.get('/salary_details')

    if (response.status == 200) {
      return (response.data) as SalaryUsageDetails
    }

    return null
  } catch (err) {
    return null
  }
}

export default api
