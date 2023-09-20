import * as Sentry from '@sentry/node';
import { notion } from "../notion";
import { billsDatabaseId, salariesDatabaseId, resumeDatabaseId } from '../config'
import { buildDatePropertyData, buildMonthSlashYearDateString } from '../utils'

export default class EnterSalaryController {
    doValidations(body, transaction) {
        const span = transaction.startChild({ op: "doValidations" });

        if (!body.salary || isNaN(body.salary)) {
            span.finish();
            throw new Error('Informe um salário válido!')
        }
        span.finish();
    }

    async createCreditCardBillItems(currentMonth: number, transaction): Promise<[number, number]>{
        const span = transaction.startChild({ op: "createCreditCardBillItems" });
        console.log('--------------------')
        console.log('createCreditCardBillItems')

        let responseBill1
        let responseBill2

        try {
            responseBill1 = await notion.pages.create({
                parent: {
                    database_id: billsDatabaseId,
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: "Fatura Santander"
                                }
                            }
                        ]
                    },
                    Valor: {
                        type: "number",
                        number: 0
                    },
                    Month: buildDatePropertyData(`2023-${currentMonth}-01`)
                }
            })

            console.log(responseBill1)
            span.setData("responseBill1", responseBill1)

            responseBill2 = await notion.pages.create({
                parent: {
                    database_id: billsDatabaseId,
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: "Fatura Nubank"
                                }
                            }
                        ]
                    },
                    Valor: {
                        type: "number",
                        number: 0
                    },
                    Month: buildDatePropertyData(`2023-${currentMonth}-01`)
                }
            })

            console.log(responseBill2)
            span.setData("responseBill2", responseBill2)
    
            if (!responseBill1.id || !responseBill2.id) {
                throw new Error('Erro ao criar faturas!')
            }

            span.finish();
            console.log('--------------------')
            return [responseBill1, responseBill2]
        } catch (err) {
            try {
                if (responseBill1 && responseBill1.id) {
                    //delete bill1
                    const responseDelete1 = await notion.pages.update({
                        page_id: responseBill1.id,
                        archived: true
                    });
                    console.log(responseDelete1)
                    span.setData("responseDelete1", responseDelete1)                      
                }
    
                if (responseBill2 && responseBill2.id) {
                    const responseDelete2 = await notion.pages.update({
                        page_id: responseBill2.id,
                        archived: true
                    }); 
                    console.log(responseDelete2)
                    span.setData("responseDelete2", responseDelete2)
                }
            } catch (err) {}

            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao criar faturas!')
        }
    }

    async createSalaryItem(salary: number, currentMonth, billId1, billId2, transaction) {
        const span = transaction.startChild({ op: "createSalary" });
        console.log('--------------------')
        console.log("createSalary")

        let salaryCreationResponse

        try {
            salaryCreationResponse = await notion.pages.create({
                parent: {
                    database_id: salariesDatabaseId,
                },
                properties: {
                    Mes: {
                        title: [
                            {
                                text: {
                                    content: buildMonthSlashYearDateString(),
                                },
                            },
                        ],
                    },
                    Date: buildDatePropertyData(`2023-${currentMonth}-01`),
                    Chegou: {
                        type: "number",
                        number: salary
                    },
                    Faturas: {
                        id: "wIjB",
                        type: "relation",
                        relation: [
                            {
                                id: billId1
                            },
                            {
                                id: billId2
                            }
                        ],
                    },
    
                }
            })

            console.log(salaryCreationResponse)
            span.setData("salaryCreationResponse", salaryCreationResponse)

            if (!salaryCreationResponse.id) {
                throw new Error('Erro ao criar salário!')
            }

            span.finish();

            console.log('--------------------')
            return salaryCreationResponse.id
        } catch (err) {
            try {
                if (salaryCreationResponse && salaryCreationResponse.id) {
                    const responseDelete = await notion.pages.update({
                        page_id: salaryCreationResponse.id,
                        archived: true
                    });
                    console.log(responseDelete)
                    span.setData("responseDelete", responseDelete)                      
                }
            } catch (err2) {}
            
            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao criar salário!')
        }
    }

    async findAllCompulsionsResumes(transaction) {
        const span = transaction.startChild({ op: "findAllCompulsionsResumes" });
        console.log('--------------------')
        console.log("findAllCompulsionsResumes")

        const responseResumesDatabase = await notion.databases.query({
            database_id: resumeDatabaseId,
        })

        console.log(responseResumesDatabase)
        span.setData("responseResumesDatabase", responseResumesDatabase)

        if (!responseResumesDatabase.results || responseResumesDatabase.results.length === 0) {
            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao buscar resumos de compulsoes!')
        }

        span.finish();
        console.log('--------------------')
        return responseResumesDatabase.results
    }

    async updateCompulsionWithSalary(resumeId: string, currentMonth: number, salaryId: string) {
        const updateResponse = await notion.pages.update({
            page_id: resumeId,
            properties: {
                "Current Month Number": {
                    type: "number",
                    number: currentMonth
                },
                'Salário': {
                    id: "RdOQ",
                    type: "relation",
                    relation: [
                        {
                            id: salaryId
                        }
                    ],
                },

            }
        })

        return updateResponse ? updateResponse.id : null
    }

    async updateCompulsionsResumesWithCorrectSalary(itemsCompulsionsResumes, currentMonth: number, salaryId: string, transaction) {
        const span = transaction.startChild({ op: "updateCompulsionsResumesWithCorrectSalary" });
        console.log('--------------------')
        console.log("updateCompulsionsResumesWithCorrectSalary")

        const pastSalaryIds = {}
        const pastMonths = {}

        try {
            let i = 1
            for (const resumeItem of itemsCompulsionsResumes) {
                if (resumeItem.properties['Current Month Number'] != currentMonth) {
                    pastSalaryIds[resumeItem.id] = resumeItem.properties['Salário'].relation[0].id
                    pastMonths[resumeItem.id] = resumeItem.properties['Current Month Number'].number
                    const updateResponse = await this.updateCompulsionWithSalary(resumeItem.id, currentMonth, salaryId)

                    console.log(updateResponse)
                    span.setData("updateResponse" + i, updateResponse)

                    if (!updateResponse || !updateResponse.id) {
                        throw new Error('Erro ao fazer updates nas compulsoes!')
                    }
                    
                    i += 1
                }
            }

            span.finish();
            console.log('--------------------')
        } catch (err) {
            let i2 = 1
            try {
                for (const itemToUndo in pastSalaryIds) {
                    const pastSalaryId = pastSalaryIds[itemToUndo]

                    const updateResponse = await this.updateCompulsionWithSalary(itemToUndo, pastMonths[itemToUndo], pastSalaryId)
                    console.log(updateResponse)
                    span.setData("updateResponse" + i2, updateResponse)
                    i2 += 1
                }
            } catch (err2) {}
            
            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao fazer updates nas compulsoes!')
        }

    }

    async doEnterSalary(req: any, res: any) {
        const transaction = Sentry.startTransaction({ name: "enter-salary-transaction" });
        transaction.setData("body", req.body)
        try {
            this.doValidations(req.body, transaction)
            
            const today = new Date()
            const currentMonth = today.getMonth() + 1
    
            const [bill1Id, bill2Id] = await this.createCreditCardBillItems(currentMonth, transaction)

            const salaryId = await this.createSalaryItem(req.body.salary, currentMonth, bill1Id, bill2Id, transaction)

            const itemsCompulsionsResumes = await this.findAllCompulsionsResumes(transaction)

            await this.updateCompulsionsResumesWithCorrectSalary(itemsCompulsionsResumes, currentMonth, salaryId, transaction)
            
            transaction.finish();
        } catch (err) {
            transaction.finish();
            res.status(400).json({
                error: (err as Error).message
            })
        }
    }
}