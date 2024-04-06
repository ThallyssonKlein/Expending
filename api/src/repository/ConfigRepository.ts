import { notion } from "../notion";

export default class ConfigRepository {
  async updateConfigTime(configId: string, newTime: string) {
    await notion.pages.update({
      page_id: configId,
      properties: {
        Tempo: {
          select: {
            name: newTime,
          },
        },
      },
    });
  }
}
