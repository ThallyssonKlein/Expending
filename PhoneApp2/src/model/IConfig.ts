export interface IConfig {
  CanUseMealsCard: boolean
  Name: string
  NameInApp: string
  Category: string
  Subcategory: string
  CustomName: boolean
  DefaultValue: number
  DefaultName: string | null
}

export interface IConfigFromApi {
  id: string
  CanUseMealsCard: boolean
  Name: string | null
  NameInApp: string | null
  Category: string | null
  Subcategory: string | null
  CustomName: boolean
  DefaultValue: number
  DefaultName: string | null
}

export interface IConfigPlusValues extends IConfig {
  Value: number
  Date: string
  CustomNameValue?: string
  Reason?: string
}
