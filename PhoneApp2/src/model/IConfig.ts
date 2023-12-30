export interface IConfig {
  CanUseMealsCard: boolean
  Name: string
  NameInApp: string
  Category: string
  Subcategory: string
  CustomName: boolean
  DefaultValue: number
}

export interface IConfigFromApi {
  CanUseMealsCard: boolean
  Name: string | null
  NameInApp: string | null
  Category: string | null
  Subcategory: string | null
  CustomName: boolean
  DefaultValue: number
}
