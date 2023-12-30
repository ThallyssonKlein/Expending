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
}
