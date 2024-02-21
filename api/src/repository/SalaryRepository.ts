import { notion } from '../notion'
import { salariesDatabaseId } from '../config'
import { SalaryFromNotionApi } from '../controller/SalaryController'

export default class SalaryRepository {
    async findCurrentMonthSalaryItem(token: string): Promise<SalaryFromNotionApi> {
        const response = await notion.databases.query({
            database_id: salariesDatabaseId(token),
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

    async findPastMonthSalaryItem(token: string): Promise<SalaryFromNotionApi | null> {
        // get the first and last day of the last month
        let date = new Date();
        let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);

        let dateString = firstDay.toISOString().split('T')[0];

        const response = await notion.databases.query({
            database_id: salariesDatabaseId(token),
            filter: {
                property: 'Date',
                date: {
                    equals: dateString,
                }
            }
        })

        if (response.results.length !== 1 || !response.results[0].properties || !response.results[0].id) {
            return null
        }

        return {
            id: response.results[0].id,
            ...response.results[0].properties
        }
    }

    async findAllSalaries(token: string) {
        const response = await notion.databases.query({
            database_id: salariesDatabaseId(token),
        })

        return response.results
    }
}