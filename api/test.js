const { Client } = require("@notionhq/client")

const notion = new Client({
    auth: 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG',
});

notion.databases.query({
    database_id: '33ddadec57b6485faae5a88d6b770141',
}).then(response => {
    console.log(JSON.stringify(response));
})
