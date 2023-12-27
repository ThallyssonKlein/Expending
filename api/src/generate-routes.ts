import {
  loadConfigsFromNotion as loadConfigsFromNotion,
  IConfig as IConfig,
  recordsDatabaseId,
  resumeDatabaseId,
} from "./config";
import { notion } from "./notion";
import { Decimal } from "decimal.js";
import { buildDatePropertyData } from "./utils";

function today() {
  const hoje = new Date();
  const dia = hoje.getDate().toString().padStart(2, "0");
  const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");
  return `${dia}/${mes}`;
}

function buildValor(valor: number, path: IConfig) {
  if (!valor && !path.defaultValue) throw new Error("Informe um valor!");

  return {
    Valor: {
      type: "number",
      number: valor ? valor : path.defaultValue,
    },
  };
}

function buildName(name: string, path: IConfig) {
  if (!name && path.customName) throw new Error("Informe um nome!");
  if (path.defaultName) {
    return {
      Name: {
        title: [
          {
            text: {
              content: path.defaultName,
            },
          },
        ],
      },
    };
  } else {
    return {
      Name: {
        title: [
          {
            text: {
              content: name ? name : today(),
            },
          },
        ],
      },
    };
  }
}

function buildCategories(path: IConfig) {
  if (path.category && path.subcategory) {
    return {
      "Big Category": {
        select: {
          name: path.category,
        },
      },
      "Sub Category": {
        select: {
          name: path.subcategory,
        },
      },
    };
  }

  return {};
}

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
      let properties = {};

      try {
        properties = {
          ...properties,
          ...buildValor(body.value, path),
        };
        properties = {
          ...properties,
          ...buildName(body.name, path),
        };
        properties = {
          ...properties,
          ...buildDatePropertyData(body.date),
        };
        properties = {
          ...properties,
          ...buildCategories(path),
        };
      } catch (err) {
        res.status(400).json({
          error: (err as Error).message,
        });
        return;
      }

      try {
        console.log("--------");
        console.log(properties);
        console.log("--------");

        await notion.pages.create({
          parent: {
            database_id: recordsDatabaseId,
          },
          properties,
        });

        res.send("ok");
      } catch (err) {
        res.status(400).json({
          error: (err as Error).message,
        });
      }
    });
  }
}

module.exports = generateRoutes;
