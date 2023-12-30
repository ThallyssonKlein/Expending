import {
  loadConfigsFromNotion as loadConfigsFromNotion,
  IConfig as IConfig,
  recordsDatabaseId,
  resumeDatabaseId,
} from "./config";
import { notion } from "./notion";
import { Decimal } from "decimal.js";
import { buildDatePropertyData } from "./utils";

interface Sums {
  [subcategory: string]: number;
}

async function searchDatabase(month: number) {
  const response = await notion.databases.query({
    database_id: "33ddadec57b6485faae5a88d6b770141",
    filter: {
      and: [
        {
          property: "Date",
          date: {
            after_or_equal: `2023-${month}-01`,
            before: `2023-${month + 1}-01`,
          },
        },
        {
          property: "Big Category",
          select: {
            equals: "1 - Compulsões",
          },
        },
      ],
    },
  });

  const filteredResults = response.results.filter((item: any) => {
    if (item.properties.Date && item.properties.Date.type === "date") {
      const dateValue = new Date(item.properties.Date.date.start);
      dateValue.setUTCHours(0, 0, 0, 0);
      const startDate = new Date(`2023-${month}-01`);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(`2023-${month + 1}-01`);
      endDate.setUTCHours(0, 0, 0, 0);

      return dateValue >= startDate && dateValue < endDate;
    }
    return false;
  });

  return { ...response, results: filteredResults };
}

async function generateRoutes(app: any) {
  for (const path of config) {
    app.post(path.path, async (req: any, res: any) => {
      const body = req.body;
    });
  }
}

module.exports = generateRoutes;
