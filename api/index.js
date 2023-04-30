const express = require('express')

const app = express()
app.use(express.json())

const access_token = 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG'
const databases = {
    energy_drink: 'eedd5638a5504b21b8072990bda89a78',
    sweet: "786bd628f0a342b98b3d642720b11ddf",
    fried_pastry: "4eb24dac86534e158401b9254dc82ab8",
    delivery: "b4fe40193cac4c1da26419d594ba01f1"
}
const port = 3000

const { Client } = require("@notionhq/client")
const notion = new Client({
    auth: access_token,
});

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

app.post('/energy_drink', async (req, res) => {
      await notion.pages.create({
            parent: {
                database_id: databases.energy_drink,
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: today(),
                            },
                        },
                    ],
                },
                Valor: {
                    type: "number",
                    number: 14
                },
                Date: {
                    date: {
                        start: isoToday() + "",
                        end: null
                    }
                },
            },
        });
    res.send('ok')
})
app.post('/unecessary_sweet', async (req, res) => {
    const body = req.body
    await notion.pages.create({
          parent: {
              database_id: databases.sweet,
          },
          properties: {
              Name: {
                  title: [
                      {
                          text: {
                              content: today(),
                          },
                      },
                  ],
              },
              Valor: {
                  type: "number",
                  number: body.value
              },
              Date: {
                date: {
                    start: isoToday() + "",
                    end: null
                }
            }, 
          },
      });
    res.send('ok')
})
app.post('/unecessary_fried_pastry', async (req, res) => {
    await notion.pages.create({
        parent: {
            database_id: databases.fried_pastry,
        },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: today(),
                        },
                    },
                ],
            },
            Valor: {
                type: "number",
                number: 10
            },
            Date: {
                date: {
                    start: isoToday() + "",
                    end: null
                }
            }, 
        },
    });
    res.send('ok')
})

app.post('/unecessary_delivery', async (req, res) => {
    const body = req.body

    await notion.pages.create({
        parent: {
            database_id: databases.delivery,
        },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: today(),
                        },
                    },
                ],
            },
            Valor: {
                type: "number",
                number: body.value
            },
            Date: {
                date: {
                    start: isoToday() + "",
                    end: null
                }
            }, 
        },
    });
    res.send('ok')
})

app.listen(port, `0.0.0.0`, () => {
    console.log(`Service initialized on port ${port}`);
});