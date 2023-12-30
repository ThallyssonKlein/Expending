import { create } from 'apisauce'
import { type IConfig, type IConfigFromApi } from '../model/IConfig'

const api = create({
  baseURL: 'https://my-expending-project.rj.r.appspot.com',
  timeout: 469000
})

export async function getOptions (selectedMode: string): Promise<IConfig[]> {
  let response

  if (selectedMode === 'compulsions') {
    response = await api.get<IConfigFromApi[]>('/compulsions_options')
  } else if (selectedMode === 'lifecost') {
    response = await api.get<IConfigFromApi[]>('/lifecost_options')
  } else {
    response = await api.get<IConfigFromApi[]>('/additional_expenses_options')
  }

  if (response?.data != null && response.status === 200) {
    if (Array.isArray(response.data)) {
      response.data = response.data.filter(item => {
        // Name, NameInApp, Category and Subcategory should not be null
        return item.Name != null && item.NameInApp != null && item.Category != null && item.Subcategory != null
      })
      return response.data.map(item => item as IConfig)
    }
  }

  return []
}

export async function post (body: IConfig): Promise<boolean> {
  const response = await api.post('/record', body)

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

    if (response.status === 200) {
      return response.data as SalaryUsageDetails
    }

    return null
  } catch (err) {
    return null
  }
}

export default api
