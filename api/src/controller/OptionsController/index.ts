import { IConfig, loadConfigsFromNotion } from "../../config";
import { Response } from "express";
import { RequestWithToken } from "../../types";

export default class OptionsController {

    private async loadConfig(req: RequestWithToken, res: Response): Promise<IConfig[] | undefined> {
        const token = req.token;
  
        let config: IConfig[] = await loadConfigsFromNotion(token);

        config = config.filter((config) => {
          if (
            config.Name &&
            config.NameInApp &&
            config.Category &&
            config.Subcategory
          ) {
            return config;
          }
        })

        return config
    }

    async getCompulsionsOptions(req: RequestWithToken, res: Response): Promise<void> {
        const config = await this.loadConfig(req, res)
        console.log(config);

        if (!config) {
            res.json([])
            return
        }

        res.json(config.filter((config) => config.Category === "1 - Compulsões"));
    }

    async getLifeCostOptions(req: RequestWithToken, res: Response): Promise<void> {
        const config = await this.loadConfig(req, res)

        if (!config) {
            res.json([])
            return
        }

        res.json(config.filter((config) => config.Category === "2 - Life Cost"));
    }

    async getAdditionalExpensesOptions(req: RequestWithToken, res: Response): Promise<void> {
        const config = await this.loadConfig(req, res)

        if (!config) {
            res.json([])
            return
        }

        res.json(config.filter((config) => config.Category === "3 - Extra"));
    }
}