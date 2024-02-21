import { notion } from "../notion";
import { recordsDatabaseId, IConfig } from "../config";
import { IConfigPlusValues } from "../controller/RecordsController";
import { buildDaySlashMonthDateString } from "../utils/title_field";
import { buildDatePropertyData } from "../utils/date_field";

export interface IRecord {
  Valor: number;
  ["Sub Category"]: string | null;
}

type IRecordFromNotion = { properties: { Valor: { number: null }, "Sub Category": {select: {name: string}} } }

type IRecordsFromNotion = {
  results: IRecordFromNotion[];
};

export default class RecordsRepository {
  private buildCategories(config: IConfig) {
    if (config.Category && config.Subcategory) {
      return {
        "Big Category": {
          select: {
            name: config.Category,
          },
        },
        "Sub Category": {
          select: {
            name: config.Subcategory,
          },
        },
      };
    }

    return {};
  }

  private buildName(config: IConfigPlusValues) {
    if (!config.CustomNameValue && config.CustomName)
      throw new Error("Informe um nome!");

    if (config.DefaultName) {
      return {
        Name: {
          title: [
            {
              text: {
                content: config.DefaultName,
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
                content: config.CustomNameValue
                  ? config.CustomNameValue
                  : buildDaySlashMonthDateString(),
              },
            },
          ],
        },
      };
    }
  }

  private buildValor(config: IConfigPlusValues) {
    if (!config.Value && !config.DefaultValue)
      throw new Error("Informe um valor!");

    return {
      Valor: {
        type: "number",
        number: config.Value ? config.Value : config.DefaultValue,
      },
    };
  }

  private buildSalary(salaryId: string) {
    if (!salaryId) throw new Error("Informe um salario!");
    return {
      Salary: {
        relation: [
          {
            id: salaryId,
          },
        ],
      },
    };
  }

  private buildReason(config: IConfigPlusValues) {
    if (config.Reason) {
      return {
        Reason: {
          rich_text: [
            {
              text: {
                content: config.Reason,
              },
            },
          ],
        },
      };
    }
  }

  async createRecord(configWithValues: IConfigPlusValues, salaryId: string, token: string) {
    let properties = {};

    properties = {
      ...properties,
      ...this.buildCategories(configWithValues),
    };
    properties = {
      ...properties,
      ...this.buildName(configWithValues),
    };
    properties = {
      ...properties,
      ...this.buildValor(configWithValues),
    };
    properties = {
      ...properties,
      ...buildDatePropertyData(configWithValues.Date),
    };
    properties = {
      ...properties,
      ...this.buildReason(configWithValues),
    };
    properties = {
      ...properties,
      ...this.buildSalary(salaryId),
    };

    await notion.pages.create({
      parent: {
        database_id: recordsDatabaseId(token),
      },
      properties,
    });
  }

  private recordMap(response: IRecordsFromNotion): IRecord[] {
    return response.results.map(
      (notionResult: IRecordFromNotion) => {
        let { Valor, SubCategory } = {
          Valor: null as number | null,
          SubCategory: null as string | null,
        };

        if (notionResult.properties.Valor.number !== null) {
          Valor = notionResult.properties.Valor.number;
        }

        if (notionResult.properties["Sub Category"].select !== null) {
          SubCategory = notionResult.properties["Sub Category"].select.name;
        }

        return {
          Valor: Valor || 0,
          ["Sub Category"]: SubCategory,
        } as IRecord;
      }
    ) as IRecord[];
  }

  async findCompulsionRecordsForAGivenSalaryId(
    salaryId: string,
    token: string
  ): Promise<IRecord[]> {
    const response = await notion.databases.query({
      database_id: recordsDatabaseId(token),
      filter: {
        and: [
          {
            property: "Salary",
            relation: {
              contains: salaryId,
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

    return this.recordMap(response);
  }

  async findExtraRecordsForAGivenSalaryId(
    salaryId: string,
    token: string
  ): Promise<IRecord[]> {
    const response = await notion.databases.query({
      database_id: recordsDatabaseId(token),
      filter: {
        and: [
          {
            property: "Salary",
            relation: {
              contains: salaryId,
            },
          },
          {
            property: "Big Category",
            select: {
              equals: "3 - Extra",
            },
          },
        ],
      },
    });

    return this.recordMap(response);
  }
}
