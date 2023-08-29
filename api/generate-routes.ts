import { loadPathsFromNotion, IPath } from "./config";
import { notion } from "./notion";

function today(){
    const hoje = new Date();
    const dia = hoje.getDate().toString().padStart(2, '0');
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
}

function isoToday(date?: Date) {
    let agora;

    if (date) {
        agora = new Date(date);
    } else {
            agora = new Date();
    }

    const offset = -3 * 60;
    return new Date(agora.getTime() + offset * 60 * 1000).toISOString();
}

function buildValor(valor: number, path: IPath) {
    if (!valor && !path.defaultValue) throw new Error('Informe um valor!');

    return {
        Valor: {
            type: "number",
            number: valor? valor : path.defaultValue
        }
    }
}

function buildName(name: string, path: IPath) {
    if(!name && path.customName) throw new Error('Informe um nome!');
    return {
        Name: {
            title: [
                {
                    text: {
                        content: name ? name : today(),
                    },
                },
            ],
        },
    }
}

function buildDate(date?: Date) {
    return {
        Date: {
            date: {
                start: date ? isoToday(date): isoToday() + "",
                end: null
            }
        },
    }
}

function buildCategories(path: IPath) {
    if (path.category && path.subcategory) {
        return {
            "Big Category": {
                "select": {
                    "name": path.category
                }
            },
            "Sub Category": {
                "select": {
                    "name": path.subcategory
                }
            }
        }
    }

    return {}
}
  
interface Sums {
    [subcategory: string]: number;
}

async function searchDatabase(month: number) {
    const response = await notion.databases.query({
        database_id: '33ddadec57b6485faae5a88d6b770141',
        filter: {
            and: [
            {
                property: "Date",
                "date": {
                    "after_or_equal": `2023-${month}-01`,
                    "before": `2023-${month + 1}-01`
                }         
            },
            {
                property: "Big Category",
                select: {
                    equals: '1 - Compulsões',
                },
            },
            ],
        },
    });

    const filteredResults = response.results.filter((item: any) => {
        // Verifique se a propriedade "Date" existe e se é do tipo "date"
        if (item.properties.Date && item.properties.Date.type === 'date') {
            const dateValue = new Date(item.properties.Date.date.start);
            const startDate = new Date(`2023-${month}-01`);
            const endDate = new Date(`2023-${month + 1}-01`);

            // Verifique se a data está no intervalo desejado
            return dateValue >= startDate && dateValue < endDate;
        }
        return false;
    });

    return { ...response, results: filteredResults };
}  
  
async function generateRoutes(app: any) {
    const paths: IPath[] = await loadPathsFromNotion();

    app.post('/refresh', async (req: any, res: any) => {
        if (!req.body.month  || !(typeof req.body.month === 'number')) {
            res.status(400).json({
                error: 'Informe um mês válido!'
            })
        }
        const itemsOfThisMonth = await searchDatabase(req.body.month)

        const groupedResults = itemsOfThisMonth.results.reduce((acc: any, result: any) => {
            const subcategory = result.properties['Sub Category'].select.name;
            if (!acc[subcategory]) {
              acc[subcategory] = [];
            }
            acc[subcategory].push(result);
            return acc;
          }, {});
        
          const sums: Sums = {};
          for (const [subcategory, results] of Object.entries(groupedResults)) {
            sums[subcategory] = (results as any).reduce(
              (acc: any, result: any) => acc + result.properties.Valor.number,
              0
            );
          }
          
          res.json(sums)
    })

    app.get('/options', (req: any, res: any) => {
        const options = []
        for(const path of paths) {
            if (path.nameInApp && !path.lifecost) {
                options.push({
                    path: path.path,
                    defaultValue: path.defaultValue,
                    hasCustomName: !!path.customName,
                    nameInApp: path.nameInApp
                })
            }
        }
        res.json(options)
    })
      
    for (const path of paths) {
        app.post(path.path, async (req: any, res: any) => {
            const body = req.body
            let properties = {}

            try {
                properties = {
                  ...properties,
                  ...buildValor(body.value, path)
                }
                properties = {
                    ...properties,
                    ...buildName(body.name, path)
                }
                properties = {
                    ...properties,
                    ...buildDate(body.date)
                }
                properties = {
                    ...properties,
                    ...buildCategories(path)
                }
            } catch (err) {
                res.status(400).json({
                    error: (err as Error).message
                })
                return
            }

            try {
                console.log('--------')
                console.log(properties)
                console.log('--------')
                                                
                await notion.pages.create({
                    parent: {
                        database_id: '33ddadec57b6485faae5a88d6b770141',
                    },
                    properties
                })

                res.send('ok')
            } catch (err) {
                res.status(400)
                    .json({
                        error: (err as Error).message
                    })
            }
        })
    }
}

module.exports = generateRoutes