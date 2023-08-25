const pathsDatabaseId = '17139f87807640ad8ac55b8bf0f27e3b';

export default {
    access_token: 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG',
}

import { notion } from "./notion";

export interface IPath {
    path: string;
    databaseId: string;
    defaultValue: number;
    customName: boolean;
    relation_name: string;
    relation_id: string;
    nameInApp: string;
}

export async function loadPathsFromNotion(): Promise<IPath[]> {
    // get IPath items from Notion table
    const response = await notion.databases.query({
        database_id: pathsDatabaseId,
    });

    const paths = response.results.map((page: any) => {
        const defaultValue = page.properties.defaultValue.number;
        const relation_id = page.properties.relation_id.rich_text;
        const relation_name = page.properties.relation_name.rich_text;
        const nameInApp = page.properties.nameInApp.rich_text;

        return {
            path: page.properties.Path.title[0].plain_text,
            databaseId: page.properties.databaseId.rich_text[0].plain_text,
            customName: page.properties.customName.checkbox,
            relation_name: relation_name.length > 0 ? relation_name[0].plain_text : null,
            relation_id: relation_id.length > 0 ? relation_id[0].plain_text : null,
            defaultValue: defaultValue ? defaultValue : null,
            nameInApp: nameInApp.length > 0 ? nameInApp[0].plain_text : null
        } as IPath;
    }
    );

    return paths;
}