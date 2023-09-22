import * as Sentry from '@sentry/node';
import { notion } from "../../notion";
import { billsDatabaseId, salariesDatabaseId, resumeDatabaseId, balanceDatabaseId } from '../../config'
import { buildDatePropertyData, buildMonthSlashYearDateString } from '../../utils'

type PastSalaryIds = {
    [key: string]: string;
};

type PastMonths = {
    [key: string]: number;
};
type DataToDelete = {
    [key: string]: string | PastSalaryIds | PastMonths;
}
  
export default class EnterSalaryController {

    doValidations(body: any, transaction: any) {
        const span = transaction.startChild({ op: "doValidations" });

        if (!body.salary || isNaN(body.salary)) {
            span.finish();
            throw new Error('Informe um salário válido!')
        }
        span.finish();
    }

    async createCreditCardBillItems(currentMonth: number, transaction: any): Promise<[string, string]>{
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
                    ...buildDatePropertyData(`2023-${currentMonth}-01`, 'Month')
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
                    ...buildDatePropertyData(`2023-${currentMonth}-01`, 'Month')
                }
            })

            console.log(responseBill2)
            span.setData("responseBill2", responseBill2)
    
            if (!responseBill1 || !responseBill2 || !responseBill1.id || !responseBill2.id) {
                throw new Error('Erro ao criar faturas!')
            }

            span.finish();
            console.log('--------------------')
            return [responseBill1.id, responseBill2.id]
        } catch (err) {
            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao criar faturas!')
        }
    }

    async createBalanceItem(transaction: any) {
        const span = transaction.startChild({ op: "createBalanceItem" });
        console.log('--------------------')
        console.log('createBalanceItem')

        let responseBalance

        try {
            responseBalance = await notion.pages.create({
                parent: {
                    database_id: balanceDatabaseId,
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: "Saldo refeição"
                                }
                            }
                        ]
                    },
                    Valor: {
                        type: "number",
                        number: 0
                    },
                }
            })

            console.log(responseBalance)
            span.setData("responseBalance", responseBalance)
    
            if (!responseBalance || !responseBalance.id) {
                throw new Error('Erro ao criar balanço!')
            }

            span.finish();
            console.log('--------------------')
            return responseBalance.id
        } catch (err) {
            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao criar balanço!')
        }

    }

    async createSalaryItem(salary: number, currentMonth: number, billId1: string, billId2: string, transaction: any, balanceId: string) {
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
                    ...buildDatePropertyData(`2023-${currentMonth}-01`),
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
                    Saldos: {
                        id: "W%5BTt",
                        type: "relation",
                        relation: [
                            {
                                id: balanceId
                            }
                        ],
                    },
                }
            })

            console.log(salaryCreationResponse)
            span.setData("salaryCreationResponse", salaryCreationResponse)

            if (!salaryCreationResponse || !salaryCreationResponse.id) {
                throw new Error('Erro ao criar salário!')
            }

            span.finish();
            console.log('--------------------')
            return salaryCreationResponse.id
        } catch (err) {            
            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao criar salário!')
        }
    }

    async findAllCompulsionsResumes(transaction: any) {
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
        return await notion.pages.update({
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
    }

    async updateCompulsionsResumesWithCorrectSalary(itemsCompulsionsResumes: any[], currentMonth: number, salaryId: string, transaction: any, pastSalaryIds: PastSalaryIds, pastMonths: PastMonths) {
        const span = transaction.startChild({ op: "updateCompulsionsResumesWithCorrectSalary" });
        console.log('--------------------')
        console.log("updateCompulsionsResumesWithCorrectSalary")

        try {
            let i = 1
            for (const resumeItem of itemsCompulsionsResumes) {
                if (resumeItem.properties['Current Month Number'] != currentMonth) {
                    pastSalaryIds[resumeItem.id] = resumeItem.properties['Salário'].relation[0].id
                    pastMonths[resumeItem.id] = resumeItem.properties['Current Month Number'].number
                    const updateResponse = await this.updateCompulsionWithSalary(resumeItem.id, currentMonth, salaryId)

                    console.log(updateResponse)
                    span.setData("updateResponse_" + i, updateResponse)

                    if (!updateResponse || !updateResponse.id) {
                        throw new Error('Erro ao fazer updates nas compulsoes!')
                    }
                    
                    i += 1
                }
            }

            span.finish();
            console.log('--------------------')
        } catch (err) {            
            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao fazer updates nas compulsoes!')
        }

    }

    async fillWhatLeftFromPastMonth(currentMonth: number, transaction: any) {
        const span = transaction.startChild({ op: "fillWhatLeftFromPastMonth" });
        console.log('--------------------')
        console.log("fillWhatLeftFromPastMonth")

        try {
            const searchPastMonthResponse = await notion.databases.query({
                database_id: salariesDatabaseId,
                filter: {
                    property: "Date",
                    date: {
                        after_or_equal: `2023-${currentMonth - 1}-01`,
                        before: `2023-${currentMonth}-01`
                    }         
                },
            });
    
            if (!searchPastMonthResponse || !searchPastMonthResponse.results || searchPastMonthResponse.results.length === 0) {
                span.finish();
                console.log('--------------------')
                throw new Error('Erro ao buscar mes passado para preencher valor que sobrou!')
            }
        
            const pastMonthItem = searchPastMonthResponse.results[0]
    
            const whatLeftFromPastMonth = pastMonthItem.properties['Quanto vai sobrar'].formula.number

            await notion.pages.update({
                page_id: pastMonthItem.id,
                properties: {
                    "Sobrou": {
                        type: "number",
                        number: whatLeftFromPastMonth
                    }
                }
            });
            span.finish();
            console.log('--------------------')
        } catch (error) {
            console.log(error)
            span.finish();
            console.log('--------------------')
            throw new Error('Erro ao buscar mes passado para preencher valor que sobrou!')
        }
    }

    async doEnterSalary(req: any, res: any) {
        const transaction = Sentry.startTransaction({ name: "enter-salary-transaction" });
        transaction.setData("body", req.body)

        const dataToDelete: DataToDelete = {}

        try {
            this.doValidations(req.body, transaction)
            
            const today = new Date()
            const currentMonth = today.getMonth() + 1
    
            const [bill1Id, bill2Id] = await this.createCreditCardBillItems(currentMonth, transaction)
            dataToDelete['bill1Id'] = bill1Id
            dataToDelete['bill2Id'] = bill2Id

            const balanceId = await this.createBalanceItem(transaction)
            dataToDelete['balanceId'] = balanceId

            const salaryId = await this.createSalaryItem(req.body.salary, currentMonth, bill1Id, bill2Id, transaction, balanceId)
            dataToDelete['salaryId'] = salaryId

            const itemsCompulsionsResumes = await this.findAllCompulsionsResumes(transaction)

            const pastSalaryIds: PastSalaryIds = {}
            const pastMonths: PastMonths = {}
            dataToDelete['pastSalaryIds'] = pastSalaryIds
            dataToDelete['pastMonths'] = pastMonths
            await this.updateCompulsionsResumesWithCorrectSalary(itemsCompulsionsResumes, currentMonth, salaryId, transaction, pastSalaryIds, pastMonths)
            await this.fillWhatLeftFromPastMonth(currentMonth, transaction)
            
            transaction.finish();

            res.status(200).send('ok')
        } catch (err) {
            const span = transaction.startChild({ op: "revertOperations" });

            try {
                span.setData("dataToDelete", dataToDelete)
                console.log('--------------------')
                console.log('revertOperations')    
    
                if (dataToDelete['bill1Id']) {
                    const responseDelete1 = await notion.pages.update({
                        page_id: dataToDelete['bill1Id'],
                        archived: true
                    });
                    console.log(responseDelete1)
                    span.setData("responseDelete1", responseDelete1)                      
                }
    
                if (dataToDelete['bill2Id']) {
                    const responseDelete2 = await notion.pages.update({
                        page_id: dataToDelete['bill2Id'],
                        archived: true
                    });
                    console.log(responseDelete2)
                    span.setData("responseDelete2", responseDelete2)                      
                }

                if (dataToDelete['balanceId']) {
                    const responseDelete3 = await notion.pages.update({
                        page_id: dataToDelete['balanceId'],
                        archived: true
                    });
                    console.log(responseDelete3)
                    span.setData("responseDelete3", responseDelete3)                      
                }

                try {
                    if (dataToDelete['salaryId']) {
                        const responseDelete4 = await notion.pages.update({
                            page_id: dataToDelete['salaryId'],
                            archived: true
                        });
                        console.log(responseDelete4)
                        span.setData("responseDelete4", responseDelete4)                      
                    }
                } catch (err2) {}
    

                let i2 = 1
                try {
                    if (dataToDelete['pastSalaryIds'] && Object.keys(dataToDelete['pastSalaryIds']).length > 0) {
                        for (const itemToUndo in (dataToDelete['pastSalaryIds'] as PastSalaryIds)) {
                            const pastSalaryId = (dataToDelete['pastSalaryIds'] as PastSalaryIds)[itemToUndo]
        
                            if (!dataToDelete['pastMonths'] || !(dataToDelete['pastMonths'] as PastMonths)[itemToUndo]) {
                                span.setData("errorUndoingItem_" + i2, itemToUndo)
                                console.log('error undoing item: ' + itemToUndo)
                                continue
                            }
                            
                            const responseDelete5 = await this.updateCompulsionWithSalary(itemToUndo, (dataToDelete['pastMonths'] as PastMonths)[itemToUndo], pastSalaryId)
                            console.log(responseDelete5)
                            span.setData("responseDelete5_" + i2, responseDelete5)
                            i2 += 1
                        }
                    }
                } catch (err2) {}    

                span.finish()
                console.log('--------------------')
            } catch (err) {
                span.finish()
            }

            transaction.finish();
            res.status(400).json({
                error: (err as Error).message
            })
        }
    }
}