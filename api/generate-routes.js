const access_token = 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG'

const { Client } = require("@notionhq/client")
const notion = new Client({
    auth: access_token,
});

const config = {
    "/energy_drink": {
        databaseId: "eedd5638a5504b21b8072990bda89a78",
        defaultValue: 14
    },
    "/unecessary_sweet": {
        databaseId: "786bd628f0a342b98b3d642720b11ddf"
    },
    "/unecessary_fried_pastry": {
        databaseId: "4eb24dac86534e158401b9254dc82ab8",
        defaultValue: 10
    },
    "/unecessary_delivery": {
        databaseId: "b4fe40193cac4c1da26419d594ba01f1"
    },
    "/life_cost_item": {
        databaseId: "e6b0d46bd87d41d892ab25022f193435",
        customName: true
    },
    "/diet_item": {
        databaseId: "f74826ab2ac5426cb03bd2085dbd3e9e",
        customName: true,
    },
    "/extra_meal": {
        databaseId: "5e485e39ec2b4b23aec4bb9414ea49da",
        customName: true,
        relation: {
            name: "Categorias Custo de Vida",
            id: "44c47b873b714ebb8d4985d5af8d7f3a"
        }
    }
}

function today(){
    const hoje = new Date();
    const dia = hoje.getDate().toString().padStart(2, '0');
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
}

function isoToday(date) {
    let agora;

    if (date) {
        agora = new Date(date);
    } else {
            agora = new Date();
    }

    const offset = -3 * 60;
    return new Date(agora.getTime() + offset * 60 * 1000).toISOString();
}

function buildValor(valor, path) {
    if (!valor && !config[path].defaultValue) throw new Error('Informe um valor!');

    return {
        Valor: {
            type: "number",
            number: valor? valor : config[path].defaultValue
        }
    }
}

function buildName(name, path) {
    if(!name && config[path].customName) throw new Error('Informe um nome!');
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

function buildDate(date) {
    return {
        Date: {
            date: {
                start: date ? isoToday(date): isoToday() + "",
                end: null
            }
        },
    }
}

function buildRelation(path) {
    return {
        [config[path].relation.name]:{
            "relation":[
               {
                  "id": config[path].relation.id
               }
            ]
         }
    }
}

function generateRoutes(app) {
    for (const path in config) {
        app.post(path, async (req, res) => {
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

                if(config[path].relation) {
                    properties = {
                      ...properties,
                      ...buildRelation(path)
                    }
                }
            } catch (err) {
                res.status(400).json({
                    error: err.message
                })
                return
            }

            try {
                await notion.pages.create({
                    parent: {
                        database_id: config[path].databaseId,
                    },
                    properties
                })

                res.send('ok')
            } catch (err) {
                res.status(400)
                    .json({
                        error: err.message
                    })
            }
        })
    }
}

module.exports = generateRoutes