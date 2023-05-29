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
    }
}

function today(){
    const hoje = new Date();
    const dia = hoje.getDate().toString().padStart(2, '0');
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
}

function isoToday() {
    const agora = new Date();
    const offset = -3 * 60; // offset em minutos para o fuso horário de Brasília (-03:00)
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

function generateRoutes(app) {
    for (const path in config) {
        app.post(path, async (req, res) => {
            const body = req.body
            let properties = {
                Name: {
                    title: [
                        {
                            text: {
                                content: today(),
                            },
                        },
                    ],
                },
                Date: {
                    date: {
                        start: isoToday() + "",
                        end: null
                    }
                },
            }

            try {
                properties = {
                  ...properties,
                  ...buildValor(body.valor, path)
                }
            } catch (err) {
                res.status(400).json({
                    error: err.message
                })
                return
            }

            await notion.pages.create({
                parent: {
                    database_id: config[path].databaseId,
                },
                properties
            })

            res.send('ok')
        })
    }
}

module.exports = generateRoutes