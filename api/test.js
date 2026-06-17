require("dotenv").config();
const { Client } = require("@notionhq/client")

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

notion.databases.query({
    database_id: process.env.NOTION_DB_SALARIES,
}).then(response => {
    console.log(JSON.stringify(response));
})
