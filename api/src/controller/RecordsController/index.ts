import * as Sentry from "@sentry/node";

import { IConfig } from "../../config";

import SalaryRepository from "../../repository/SalaryRepository";
import RecordsRepository from '../../repository/RecordsRepository';

export interface IConfigPlusValues extends IConfig {
  Value: number;
  Date: string;
  CustomNameValue?: string;
  Reason?: string;
}

export default class RecordsController {
  private salaryRepository: SalaryRepository = new SalaryRepository();
  private recordsRepository: RecordsRepository = new RecordsRepository();

  async createRecord(req: any, res: any) {
    const transaction = Sentry.startTransaction({
      name: "create-record-transaction",
    });

    const configWithValues = req.body as IConfigPlusValues;
    // validate if value, date, Category, and Subcategory arent empty:
    if (
      !configWithValues.Value ||
      !configWithValues.Date ||
      !configWithValues.Category ||
      !configWithValues.Subcategory
    ) {
      transaction.setData("configValues", configWithValues);
      res.status(400).send();
      return;
    }

    //find currentSalary of this month or return 400
    const currentSalary = await this.salaryRepository.findCurrentMonthSalaryItem();
    if (!currentSalary || !currentSalary.id) {
      res.status(400).send();
      return;
    }

    try {
        this.recordsRepository.createRecord(configWithValues, currentSalary.id)
    } catch (err) {
        res.status(400).json({
            error: (err as Error).message,
        });
    }

    transaction.finish();
    res.status(200).send();
  }
}
