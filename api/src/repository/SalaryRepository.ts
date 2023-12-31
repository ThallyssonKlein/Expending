import { notion } from '../notion'
import { salariesDatabaseId } from '../config'
import { SalaryFromNotionApi } from '../controller/SalaryController'

export default class SalaryRepository {
    async findCurrentMonthSalaryItem(): Promise<SalaryFromNotionApi> {
        const response = await notion.databases.query({
            database_id: salariesDatabaseId,
            filter: {
                property: 'This Month',
                formula: {
                    checkbox: {
                        equals: true
                    }
                }
            }
        })

        if (response.results.length !== 1 || !response.results[0].properties || !response.results[0].id) {
            throw new Error('Could not find salary for this month')
        }

        return {
            id: response.results[0].id,
            ...response.results[0].properties
        }
    }

    async findAllSalaries() {
        const response = await notion.databases.query({
            database_id: salariesDatabaseId,
        })

        return response.results
    }
}