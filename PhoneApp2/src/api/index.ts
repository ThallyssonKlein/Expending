import { create } from 'apisauce'
import { type IConfig, type IConfigFromApi } from '../model/IConfig'
import retry from 'async-retry'

const api = create({
  baseURL: 'https://my-expending-project.rj.r.appspot.com',
  timeout: 469000
})

export async function getOptions (selectedMode: string): Promise<IConfig[]> {
  let response
  try {
    if (selectedMode === 'compulsions') {
      response = await retry(async () => {
        const r = await api.get<IConfigFromApi[]>('/compulsions_options')

        if (r.status !== 200) {
          throw new Error('Error fetching compulsions options')
        } else {
          return r
        }
      }, { retries: 3 })
    } else if (selectedMode === 'lifecost') {
      response = await retry(async () => {
        const r = await api.get<IConfigFromApi[]>('/lifecost_options')

        if (r.status !== 200) {
          throw new Error('Error fetching lifecost options')
        } else {
          return r
        }
      }, { retries: 3 })
    } else {
      response = await retry(async () => {
        const r = await api.get<IConfigFromApi[]>('/additional_expenses_options')

        if (r.status !== 200) {
          throw new Error('Error fetching additional expenses options')
        } else {
          return r
        }
      }, { retries: 3 })
    }
  } catch (err) {
    return []
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
  lifeCostTotal: number
  compulsionsTotal: number
  extrasTotal: number
  salaryRest: number
  mealVouncherRest: number
}

interface Page {
  object: string
  id: string
  created_time: string
  last_edited_time: string
  cover: null
  icon: null
  archived: boolean
  url: string
  public_url: null | string
}

export async function getSalaryDetails (): Promise<SalaryUsageDetails | null> {
  try {
    const response = await api.get('/current_salary_details')

    if (response.status === 200) {
      return response.data as SalaryUsageDetails
    }

    return null
  } catch (err) {
    return null
  }
}

export async function getCurrentSalary (): Promise<Page | null> {
  try {
    const response = await retry(async () => {
      const r = await api.get('/current_salary')

      if (response.status !== 200) {
        throw new Error('Error fetching current salary')
      } else {
        return r
      }
    }, { retries: 3 })

    return response?.data as Page
  } catch (err) {
    return null
  }
}

export async function createSalary (salary: number, vouncher: number): Promise<void> {
  try {
    const response = await api.post('/salary', { salary, mealVouncher: vouncher })
    console.log(response.data)
  } catch (err) {
    console.log(err)
  }
}

export default api
