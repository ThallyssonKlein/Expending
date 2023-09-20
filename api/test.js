const { Client } = require("@notionhq/client")

const notion = new Client({
    auth: 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG',
});

// notion.databases.query({
//     database_id: '2ff700ffa96d4ff3895c868f1c2198ad',
// }).then(response => {
//     console.log(JSON.stringify(response));
// })

// notion.pages.create({
//     parent: {
//         database_id: 'd9a3cc51e9d04f6697a16e46d37b7662',
//     },
//     properties: {
//         Name: {
//             title: [
//                 {
//                     text: {
//                         content: "Fatura Nubank"
//                     }
//                 }
//             ]
//         }
//     }
// }).then(response => {
//     console.log(response);
// })

// https://www.notion.so/thallyssonklein/Fatura-Nubank-?pvs=4

notion.pages.update({
    page_id: '8dfdef9006704d78bca03cf29671287a',
    properties: {
        Valor: {
            type: "number",
            number: 10
        },
    }
}).then(response => {
    console.log(response);
})