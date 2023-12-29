import * as Sentry from "@sentry/node";
import { notion } from "../../notion";

import { salariesDatabaseId, recordsDatabaseId } from "../../config";

import SalaryRepository from "../../repository/SalaryRepository";

import {
  convertDateToYearTraceMonthTraceDayFormat,
  buildDatePropertyData,
  getDateOfTheFirstDayOfThisMonth,
} from "../../utils/date_field";
import { buildMonthSlashYearDateString } from "../../utils/title_field";

interface SalaryFromNotionApi {
  Mes: {
    title: [
      {
        text: {
          content: string;
        };
      }
    ];
  };
  "Quanto pode chegar": {
    type: string;
    number: number;
  };
  Date: {
    date: {
      start: string;
      end: null;
    };
  };
}

interface PastMonthSalaryFromNotionApi extends SalaryFromNotionApi {
  Chegou?: {
    type: string;
    number: number;
  };
}

export default class EnterSalaryController {
  private salaryRepository: SalaryRepository = new SalaryRepository();

  private async createSalaryItem(
    salaryAverage: number,
    transaction: any,
    pastMonth: boolean = false,
    salary?: number
  ) {
    const span = transaction.startChild({ op: "createSalary" });
    console.log("--------------------");
    console.log("createSalary");

    let salaryCreationResponse;

    console.log("average: " + salaryAverage);
    try {
      let properties: SalaryFromNotionApi = {
        Mes: {
          title: [
            {
              text: {
                content: buildMonthSlashYearDateString(pastMonth),
              },
            },
          ],
        },
        "Quanto pode chegar": {
          type: "number",
          number: salaryAverage,
        },
        // fill the date with the first day of this month
        ...buildDatePropertyData(
          convertDateToYearTraceMonthTraceDayFormat(
            getDateOfTheFirstDayOfThisMonth(pastMonth)
          )
        ),
      };

      let properties2: PastMonthSalaryFromNotionApi =
        properties as SalaryFromNotionApi;

      if (salary) {
        properties2 = {
          ...properties,
          Chegou: {
            type: "number",
            number: salary,
          },
        };
      }

      salaryCreationResponse = await notion.pages.create({
        parent: {
          database_id: salariesDatabaseId,
        },
        properties: { ...properties2 },
      });

      console.log(salaryCreationResponse);
      span.setData("salaryCreationResponse", salaryCreationResponse);

      if (!salaryCreationResponse || !salaryCreationResponse.id) {
        throw new Error("Erro ao criar salário!");
      }

      span.finish();
      console.log("--------------------");
      return salaryCreationResponse.id;
    } catch (err) {
      span.finish();
      console.log("--------------------");
      throw new Error("Erro ao criar salário!");
    }
  }

  // new enter salary
  async enterSalary(req: any, res: any) {
    const transaction = Sentry.startTransaction({
      name: "enter-salary-transaction",
    });

    // get salary from request body
    // return 400 if salary was not informed or is not a number
    const salary = req.body.salary;
    if (!salary || isNaN(salary)) {
      transaction.finish();
      res.status(400).json({
        error: "Salário não informado ou não é um número!",
      });
      return;
    }

    // find all salaries and get the average of the field "Chegou":
    const salaries = await this.salaryRepository.findAllSalaries();

    const average =
      salaries.reduce((total: number, salary: any) => {
        return (
          total +
          ((salary.properties as PastMonthSalaryFromNotionApi)?.["Chegou"]
            ?.number ?? 0)
        );
      }, 0) / salaries.length; // Subtract 1 from the length

    // createSalaryPastMonth
    this.createSalaryItem(average, transaction, true, salary);

    // createSalary currentMonth
    this.createSalaryItem(average, transaction, false);

    transaction.finish();
    res.status(200).send();
  }

  // TODO - Get Salary Id to use on the app
  async getCurrentSalary(req: any, res: any) {
    const transaction = Sentry.startTransaction({
      name: "find-current-salary-transaction",
    });
    transaction.setData("body", req.body);

    try {
      const currentSalaryItem =
        await this.salaryRepository.findCurrentMonthSalaryItem();

      transaction.finish();
      res.status(200).json({
        whatWillBeLeft:
          currentSalaryItem.properties["Quanto vai sobrar"].formula.number,
        whatWillBeLeftWithoutCompulsions:
          currentSalaryItem.properties["Quanto Sobraria sem Compulsões"].formula
            .number,
        currentSalaryUsePercentage:
          currentSalaryItem.properties["% do salário atual"].formula.number,
      });
    } catch (err) {
      transaction.finish();
      res.status(400).json({
        error: (err as Error).message,
      });
    }
  }

  // TODO - Create job to run this
  async fillSalarySums(req: any, res: any) {
    // fill "Soma Compulsoes", "Soma Gastos Extras" and "Soma Custo de Vida" fields of salary

    // get the currentSalary of the month by using findCurrentMonthSalaryItem from repository
    const currentSalary =
      await this.salaryRepository.findCurrentMonthSalaryItem();
    // search on recordsDatabase for records with the field Salary linked to the currentSalary of the month and with the field "Big Category" with the value "1 - Compulsões"
    const compulsions = await notion.query({
      database_id: recordsDatabaseId,
      filter: {
        and: [
          {
            property: "Salary",
            relation: {
              id: currentSalary.id,
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
    //sum compulsions by "Valor"
    const compulsionsSum = compulsions.results.reduce(
      (total: number, item: any) => {
        return total + item.properties["Valor"].number;
      },
      0
    );

    // search on recordsDatabase for records with the field Salary linked to the currentSalary of the month and with the field "Big Category" with the value "2 - Life Cost"

    const lifeCosts = await notion.query({
      database_id: recordsDatabaseId,
      filter: {
        and: [
          {
            property: "Salary",
            relation: {
              id: currentSalary.id,
            },
          },
          {
            property: "Big Category",
            select: {
              equals: "2 - Life Cost",
            },
          },
        ],
      },
    });
    // sum lifeCosts by "Valor"
    const lifeCostsSum = lifeCosts.results.reduce(
      (total: number, item: any) => {
        return total + item.properties["Valor"].number;
      },
      0
    );

    // search on recordsDatabase for records with the field Salary linked to the currentSalary of the month and with the field "Big Category" with the value "3 - Extra"
    const extras = await notion.query({
      database_id: recordsDatabaseId,
      filter: {
        and: [
          {
            property: "Salary",
            relation: {
              id: currentSalary.id,
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
    // sum extras by "Valor"
    const extrasSum = extras.results.reduce((total: number, item: any) => {
      return total + item.properties["Valor"].number;
    }, 0);

    // update currentSalary with the sums of compulsions, lifeCosts and extras
    await notion.pages.update({
      page_id: currentSalary.id,
      properties: {
        "Soma Compulsões": {
          number: compulsionsSum,
        },
        "Soma Gastos Extras": {
          number: extrasSum,
        },
        "Soma Custo de Vida": {
          number: lifeCostsSum,
        },
      },
    });

    res.status(200).send();
  }
}
