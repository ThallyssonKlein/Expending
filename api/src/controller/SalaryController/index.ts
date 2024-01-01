import * as Sentry from "@sentry/node";
import { notion } from "../../notion";
import { Request, Response } from "express";

import { salariesDatabaseId, loadLifeCostConfigsFromNotion, IConfig } from "../../config";

import SalaryRepository from "../../repository/SalaryRepository";
import RecordsRepository, { IRecord } from "../../repository/RecordsRepository";

import {
  convertDateToYearTraceMonthTraceDayFormat,
  buildDatePropertyData,
  getDateOfTheFirstDayOfThisMonth,
} from "../../utils/date_field";
import { buildMonthSlashYearDateString } from "../../utils/title_field";

export interface SalaryFromNotionApi {
  id?: string,
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
  "Quanto pode chegar Refeicao": {
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
  "Chegou Refeicao"?: {
    type: string;
    number: number;
  };
}

export default class EnterSalaryController {
  private salaryRepository: SalaryRepository = new SalaryRepository();
  private recordsRepository: RecordsRepository = new RecordsRepository();

  private async createSalaryItem(
    salaryAverage: number,
    mealVouncherAverage: number,
    transaction: any,
    pastMonth: boolean = false,
    salary?: number,
    mealVouncher?: number,
    update: boolean = false,
    salaryIdToUpdate?: string
  ) {
    const span = transaction.startChild({ op: "createSalary" });
    console.log("--------------------");
    console.log("createSalary");

    let salaryCreationResponse;

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
        "Quanto pode chegar Refeicao": {
          type: "number",
          number: mealVouncherAverage,
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

      if (salary && mealVouncher) {
        properties2 = {
          ...properties,
          Chegou: {
            type: "number",
            number: salary,
          },
          "Chegou Refeicao": {
            type: "number",
            number: mealVouncher,
          },
        };
      }

      if (update) {
        salaryCreationResponse = await notion.pages.update({
          page_id: salaryIdToUpdate,
          properties: { ...properties2 },
        });
      } else {
        salaryCreationResponse = await notion.pages.create({
          parent: {
            database_id: salariesDatabaseId,
          },
          properties: { ...properties2 },
        });
      }

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
  async createSalary(req: Request, res: Response) {
    try {
      const transaction = Sentry.startTransaction({
        name: "enter-salary-transaction",
      });
  
      // get salary from request body
      // return 400 if salary was not informed or is not a number
      const salary = req.body.salary;
      const mealVouncher = req.body.mealVouncher;
      if (!salary || isNaN(salary)) {
        transaction.finish();
        res.status(400).json({
          error: "Salário não informado ou não é um número!",
        });
        return;
      }
      if (!mealVouncher || isNaN(mealVouncher)) {
        transaction.finish();
        res.status(400).json({
          error: "Vale refeição não informado ou não é um número!",
        });
        return;
      }
  
      // find all salaries and get the average of the field "Chegou":
      let salaries = await this.salaryRepository.findAllSalaries();
      // remove the itens with "Chegou" or "Chegou Refeicao" equals to "0" to not affect the average
      salaries = salaries.filter((salary: { properties: PastMonthSalaryFromNotionApi; }) => {
        return (
          ((salary.properties as PastMonthSalaryFromNotionApi)?.["Chegou"]
            ?.number ?? 0) > 0 &&
          ((salary.properties as PastMonthSalaryFromNotionApi)?.[
            "Chegou Refeicao"
          ]?.number ?? 0) > 0
        );
      })

      const average =
        salaries.reduce((total: number, salary: any) => {
          return (
            total +
            ((salary.properties as PastMonthSalaryFromNotionApi)?.["Chegou"]
              ?.number ?? 0)
          );
        }, 0) / salaries.length; // Subtract 1 from the length
      // calculate mealVouncher average from "Chegou Refeicao" field
      const mealVouncherAverage =
        salaries.reduce((total: number, salary: any) => {
          return (
            total +
            ((salary.properties as PastMonthSalaryFromNotionApi)?.[
              "Chegou Refeicao"
            ]?.number ?? 0)
          );
        }, 0) / salaries.length; // Subtract 1 from the length
  
      // createSalaryPastMonth
      // verify if salary of past month exists
      const pastMonthSalary = await this.salaryRepository.findPastMonthSalaryItem();
      if (pastMonthSalary && pastMonthSalary.id) {
        this.createSalaryItem(
          average,
          mealVouncherAverage,
          transaction,
          true,
          salary,
          mealVouncher,
          true,
          pastMonthSalary.id
        );
      } else {
        this.createSalaryItem(average, mealVouncherAverage, transaction, true, salary, mealVouncher);
      }
  
      // createSalary currentMonth
      this.createSalaryItem(average, mealVouncherAverage, transaction, false);
  
      transaction.finish();
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Erro ao criar salário!",
      });
    }
  }

  async getCurrentSalary(req: Request, res: Response): Promise<SalaryFromNotionApi | undefined> {
    const transaction = Sentry.startTransaction({
      name: "get-current-salary-transaction",
    });

    try {
      const salary = await this.salaryRepository.findCurrentMonthSalaryItem();

      if (!salary) {
        res.status(404).json({
          error: "Salário não encontrado!",
        });
        return;
      }

      transaction.finish();
      res.status(200).json(salary);
    } catch (e) {
      res.status(404).json({
        error: "Salário não encontrado!",
      });
    }
  }

  async getCurrentSalaryDetails(req: Request, res: Response) {
    try {
      const configs: IConfig[] = await loadLifeCostConfigsFromNotion();

      const lifeCostTotal = configs.reduce(
        (total, config) => total + config.Total,
        0
      );

      // find the currentSalary of this month and get its id
      const currentSalary = await this.salaryRepository.findCurrentMonthSalaryItem();
      const currentSalaryId = currentSalary?.id;
    
      // if not current salary, return 404
      if (!currentSalaryId) {
        res.status(404).json({
          error: "Salário não encontrado!",
        });
        return;
      }

      // find all records of this month
      const compulsionRecords = await this.recordsRepository.findCompulsionRecordsForAGivenSalaryId(currentSalaryId);

      // calculate the total of compulsions
      const compulsionsTotal = compulsionRecords.reduce(
        (total, record) => total + record.Valor,
        0
      );

      //find all extras
      const extrasRecords = await this.recordsRepository.findExtraRecordsForAGivenSalaryId(currentSalaryId);

      // calculate the total of extras
      const extrasTotal = extrasRecords.reduce(
        (total, record) => total + record.Valor,
        0
      );

      console.log(currentSalary)

      // find all configs that can use mealsVouncher
      const mealVouncherConfigs = configs.filter(
        (config) => config.CanUseMealsCard
      );
      // sum the total of only this configs
      const canUseMealCardTotal = mealVouncherConfigs.reduce(
        (total, config) => total + config.Total,
        0
      );

      const mealVouncherRest = currentSalary["Quanto pode chegar Refeicao"].number - (canUseMealCardTotal + compulsionsTotal)

      // findAllConfigs that can't use mealsVouncher
      const noMealVouncherConfigs = configs.filter(
        (config) => !config.CanUseMealsCard
      );
      // sum the total of only this configs
      const noMealVouncherTotal = noMealVouncherConfigs.reduce(
        (total, config) => total + config.Total,
        0
      );

      const salaryRest = currentSalary["Quanto pode chegar"].number - (noMealVouncherTotal + extrasTotal)

      res.status(200).json({
        lifeCostTotal,
        compulsionsTotal,
        extrasTotal,
        salaryRest,
        mealVouncherRest
      })
    } catch (err) {
      console.log(err)
      res.status(404).json({
        error: "Salário não encontrado!",
      });
    }
  }
}
