const { Client } = require("@notionhq/client")

const notion = new Client({
    auth: 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG',
});

// notion.databases.query({
//     database_id: '914acfb686f84c849fad7f5c8896b853',
// }).then(response => {
//     console.log(JSON.stringify(response));
// })

function buildYearTraceMonthTraceDayTraceDateString() {
    let agr = new Date();

    // agr.setUTCHours(0, 0, 0, 0); // Zera o tempo UTC
    // return agr.toISOString()
    // return the date in the format 2023-02-23

    const dia = agr.getDate().toString().padStart(2, '0');
    const mes = (agr.getMonth() + 1).toString().padStart(2, '0');
    const ano = agr.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

console.log(buildYearTraceMonthTraceDayTraceDateString())

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