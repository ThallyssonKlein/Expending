const { Client } = require("@notionhq/client")

const notion = new Client({
    auth: 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG',
});

notion.databases.query({
    database_id: '914acfb686f84c849fad7f5c8896b853',
    filter: {
        property: 'This Month',
        formula: {
            checkbox: {
                equals: true
            }
        }
    }
}).then(response => {
    console.log(JSON.stringify(response));
})

// const dataString = '2023-09-01';
// const [ano, mes, dia] = dataString.split('-').map(Number);  // Divide a string e converte cada pedaço para um número
// const dataLocal = new Date(ano, mes - 1, dia);  // Cria um novo objeto Date no fuso horário local
// console.log(dataLocal.getMonth());  // Deve imprimir 8


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

// notion.pages.update({
//     page_id: '8dfdef9006704d78bca03cf29671287a',
//     properties: {
//         Valor: {
//             type: "number",
//             number: 10
//         },
//     }
// }).then(response => {
//     console.log(response);
// })