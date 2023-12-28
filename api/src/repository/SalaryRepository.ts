import { notion } from '../notion'
import { salariesDatabaseId } from '../config'

export default class SalaryRepository {
    async findCurrentMonthSalaryItem() {
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

        if (response.results.length !== 1) {
            throw new Error('Could not find salary for this month')
        }

        return response.results[0]
    }

    async findAllSalaries() {
        const response = await notion.databases.query({
            database_id: salariesDatabaseId,
        })

        return response.results
    }
}