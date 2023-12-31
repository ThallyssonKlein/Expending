const { Client } = require("@notionhq/client")

const notion = new Client({
    auth: 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG',
});

notion.databases.query({
    database_id: '5ffb177a9e57475cbe14f50664dd9387',
}).then(response => {
    console.log(JSON.stringify(response));
})