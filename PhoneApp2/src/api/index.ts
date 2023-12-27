import { create } from 'apisauce'
import type IOption from '../model/IOption'

const api = create({
  baseURL: 'https://my-expending-project.rj.r.appspot.com',
  timeout: 469000
})

export interface IBodyPostInput {
  value: number
  date?: string
}

export async function getOptions (selectedMode: string): Promise<IOption[]> {
  let response

  if (selectedMode === 'compulsions') {
    response = await api.get<IOption[]>('/options_v1')
  } else if (selectedMode === 'lifecost') {
    response = await api.get<IOption[]>('/options_v2')
  } else {
    response = await api.get<IOption[]>('/options_v3')
  }

  if (response?.data != null && response.status === 200) {
    if (
      Array.isArray(response.data) &&
      response.data.every(
        item =>
          'hasDefault' in item &&
          'defaultValue' in item &&
          'nameInApp' in item &&
          'path' in item
      )
    ) {
      return response.data
    }
  }

  return []
}

export async function post (path: string, body: IBodyPostInput): Promise<boolean> {
  const response = await api.post(path, body)

  return response.status === 200
}

export interface SalaryUsageDetails {
  whatWillBeLeft?: number
  whatWillBeLeftWithoutCompulsions?: number
  currentSalaryUsePercentage?: number
  dialogVisible?: boolean
}

export async function getSalaryDetails (): Promise<SalaryUsageDetails | null> {
  try {
    const response = await api.get('/current_salary')

    if (response.status == 200) {
      return response.data as SalaryUsageDetails
    }

    return null
  } catch (err) {
    return null
  }
}

export default api
