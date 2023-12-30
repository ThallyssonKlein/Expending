export const salariesDatabaseId = "5ffb177a9e57475cbe14f50664dd9387";
export const recordsDatabaseId = "33ddadec57b6485faae5a88d6b770141";

const configssDatabaseId = "8bec8602848a4a6dbf5432fed52fd1f6";

export default {
  access_token: "secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG",
};
import { notion } from "./notion";

export interface IConfig {
  CanUseMealsCard: boolean;
  Name: string | null;
  NameInApp: string | null;
  Category: string | null;
  Subcategory: string | null;
  CustomName: boolean;
  DefaultValue: number;
}

// TODO - Improve this validations
export async function loadConfigsFromNotion(): Promise<IConfig[]> {
  const response = await notion.databases.query({
    database_id: configssDatabaseId,
  });

  const configs = response.results.map((page: any) => {
    let { CanUseMealsCard, Name, NameInApp, Category, Subcategory, CustomName, DefaultValue } = {
      CanUseMealsCard: null,
      Name: null,
      NameInApp: null,
      Category: null,
      Subcategory: null,
      CustomName: null,
      DefaultValue: null,
    };

    if (page.properties.CanUseMealsCard.checkbox !== null) {
      CanUseMealsCard = page.properties.CanUseMealsCard.checkbox;
    }

    if (page.properties.Name.title.length > 0) {
      Name = page.properties.Name.title[0].plain_text;
    }

    if (page.properties.NameInApp.rich_text.length > 0) {
      NameInApp = page.properties.NameInApp.rich_text[0].plain_text;
    }

    if (page.properties.Category.select !== null) {
      Category = page.properties.Category.select.name;
    }

    if (page.properties.Subcategory.select !== null) {
      Subcategory = page.properties.Subcategory.select.name;
    }

    CustomName = page.properties.CustomName.checkbox;

    if (page.properties.DefaultValue.number != null) {
      DefaultValue = page.properties.DefaultValue.number;
    }

    return {
      CanUseMealsCard: CanUseMealsCard || false,
      Name: Name || "",
      NameInApp: NameInApp || "",
      Category: Category || "",
      Subcategory: Subcategory || "",
      CustomName: CustomName || false,
      DefaultValue: DefaultValue || 0,
    } as IConfig;
  });

  return configs;
}
