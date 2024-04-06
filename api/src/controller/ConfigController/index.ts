import { IConfig, loadConfigsFromNotion } from "../../config";
import ConfigRepository from "../../repository/ConfigRepository";
import RecordsRepository from "../../repository/RecordsRepository";

export default class ConfigController {
    private recordsRepository: RecordsRepository = new RecordsRepository();
    private configRepository: ConfigRepository = new ConfigRepository();
    
    private calcularMaiorUnidade(dataInicial: Date, dataFinal: Date) {
        var diferencaEmMilissegundos = dataFinal.getTime() - dataInicial.getTime();
        var diferencaEmHoras = diferencaEmMilissegundos / (1000 * 60 * 60);
        var diferencaEmDias = diferencaEmHoras / 24;
        var diferencaEmSemanas = diferencaEmDias / 7;
        var diferencaEmMeses = diferencaEmDias / 30; // Aproximação
        var diferencaEmAnos = diferencaEmMeses / 12;
      
        if (diferencaEmAnos >= 1) {
          return diferencaEmAnos.toFixed(1) + " ano(s)";
        } else if (diferencaEmMeses >= 1) {
          return diferencaEmMeses.toFixed(1) + " mês(es)";
        } else if (diferencaEmSemanas >= 1) {
          return diferencaEmSemanas.toFixed(1) + " semana(s)";
        } else if (diferencaEmDias >= 1) {
          return diferencaEmDias.toFixed(1) + " dia(s)";
        } else {
          return diferencaEmHoras.toFixed(1) + " hora(s)";
        }
    }
    
    async fillConfigTimeFields() {
        const configs: IConfig[] = await loadConfigsFromNotion()

        for (const config of configs) {
            const recordsForThatConfig = await this.recordsRepository.findRecordsForAGivenConfigId(config.id);

            if (recordsForThatConfig[0] && recordsForThatConfig[1]) {
                if (recordsForThatConfig[0].Date !== null && recordsForThatConfig[1].Date !== null) {
                    await this.configRepository.updateConfigTime(config.id, this.calcularMaiorUnidade(recordsForThatConfig[0].Date, recordsForThatConfig[1].Date))
                }
            }
        }
    }
}