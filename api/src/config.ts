import dotenv from "dotenv";
dotenv.config();

const USER_TOKEN_1 = process.env.USER_TOKEN_1 || "";
const USER_TOKEN_2 = process.env.USER_TOKEN_2 || "";

export function salariesDatabaseId(token: string) {
  if (token === USER_TOKEN_1 || token === USER_TOKEN_2) {
    return process.env.NOTION_DB_SALARIES || "";
  }
  return "";
}

export function recordsDatabaseId(token: string) {
  if (token === USER_TOKEN_1 || token === USER_TOKEN_2) {
    return process.env.NOTION_DB_RECORDS || "";
  }
  return "";
}

function configssDatabaseId(token: string) {
  if (token === USER_TOKEN_1 || token === USER_TOKEN_2) {
    return process.env.NOTION_DB_CONFIGS || "";
  }
  return "";
}

export default {
  access_token: process.env.NOTION_TOKEN || "",
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
  DefaultName: string | null;
  Total: number;
  Archived: boolean;
}

function configMap(response: { results: any[]; }) {
  return response.results.map((page: any) => {
    let { CanUseMealsCard, Name, NameInApp, Category, Subcategory, CustomName, DefaultValue, DefaultName, Total, Archived } = {
      CanUseMealsCard: null,
      Name: null,
      NameInApp: null,
      Category: null,
      Subcategory: null,
      CustomName: null,
      DefaultValue: null,
      DefaultName: null,
      Total: null,
      Archived: null
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

    return {
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
    } as IConfig;
  });

}
// TODO - Improve this validations
export async function loadConfigsFromNotion(token: string): Promise<IConfig[]> {
  let database_id
  try {
    database_id = configssDatabaseId(token)
  } catch (err) {
    throw err
  }
  const response = await notion.databases.query({
    database_id,
    filter: {
      property: "Archived",
      checkbox: {
        equals: false,
      },
    },  
  });


  return configMap(response);
}