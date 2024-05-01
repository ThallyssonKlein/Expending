export const salariesDatabaseId = "5ffb177a9e57475cbe14f50664dd9387";
export const recordsDatabaseId = "33ddadec57b6485faae5a88d6b770141";

const configssDatabaseId = "8bec8602848a4a6dbf5432fed52fd1f6";

export default {
  access_token: "secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG",
};
import { notion } from "./notion";

// 'Last Date': {
//     id: 'EdD%5B',
//     type: 'rollup',
//     rollup: { type: 'date', date: null, function: 'latest_date' }
//   },

export interface IConfig {
  id: string;
  CanUseMealsCard: boolean;
  Name: string | null;
  NameInApp: string | null;
  Category: string | null;
  Subcategory: string | null;
  CustomName: boolean;
  DefaultValue: number;
  DefaultName: string | null;
  Total: number;
  Archived: boolean;
  LastDate: Date | null;
}

function configMap(results: any[]) {
  return results.map((page: any) => {
    let {
      CanUseMealsCard,
      Name,
      NameInApp,
      Category,
      Subcategory,
      CustomName,
      DefaultValue,
      DefaultName,
      Total,
      Archived,
      LastDate
    } = {
      CanUseMealsCard: null,
      Name: null,
      NameInApp: null,
      Category: null,
      Subcategory: null,
      CustomName: null,
      DefaultValue: null,
      DefaultName: null,
      Total: null,
      Archived: null,
      LastDate: null
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

    if (page.properties.DefaultName.rich_text.length > 0) {
      DefaultName = page.properties.DefaultName.rich_text[0].plain_text;
    }

    if (page.properties.Total.formula.number != null) {
      Total = page.properties.Total.formula.number;
    }

    Archived = page.properties.Archived.checkbox;
    LastDate = page.properties['Last Date'].rollup.date;

    return {
      id: page.id,
      CanUseMealsCard: CanUseMealsCard || false,
      Name: Name || "",
      NameInApp: NameInApp || "",
      Category: Category || "",
      Subcategory: Subcategory || "",
      CustomName: CustomName || false,
      DefaultValue: DefaultValue || 0,
      DefaultName: DefaultName || "",
      Total: Total || 0,
      Archived: Archived || false,
      LastDate
    } as IConfig;
  });
}
// TODO - Improve this validations
export async function loadConfigsFromNotion() {
  let startCursor: string | undefined = undefined;
  const results: any[] = [];

  while (true) {
    const response: any = await notion.databases.query({
      database_id: configssDatabaseId,
      start_cursor: startCursor,
      page_size: 100, // you can set the number of items to fetch per request
    });

    results.push(...response.results);

    if (!response.has_more) {
      break;
    }

    startCursor = response.next_cursor;
  }

  return configMap(results);
}