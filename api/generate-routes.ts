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

function buildRelation(path: IPath) {
    return {
        [path.relation_name]:{
            "relation":[
               {
                  "id": path.relation_id
               }
            ]
         }
    }
}

async function generateRoutes(app: any) {
    const paths: IPath[] = await loadPathsFromNotion();

    app.get('/options', (req: any, res: any) => {
        const options = []
        for(const path of paths) {
            options.push({
                path: path.path,
                defaultValue: path.defaultValue,
                hasCustomName: !!path.customName,
                nameInApp: path.nameInApp
            })
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

                if(path.relation_id && path.relation_name) {
                    properties = {
                      ...properties,
                      ...buildRelation(path)
                    }
                }
            } catch (err) {
                res.status(400).json({
                    error: (err as Error).message
                })
                return
            }

            try {
                await notion.pages.create({
                    parent: {
                        database_id: path.databaseId,
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