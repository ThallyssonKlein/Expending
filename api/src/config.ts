export const recordsDatabaseId = '33ddadec57b6485faae5a88d6b770141'
export const resumeDatabaseId = '2ff700ffa96d4ff3895c868f1c2198ad'
export const salariesDatabaseId = '914acfb686f84c849fad7f5c8896b853'
export const billsDatabaseId = 'd9a3cc51e9d04f6697a16e46d37b7662'
export const balanceDatabaseId = 'd9a154666088476bbf60a089c8753e2f'

const pathsDatabaseId = 'e75ff5d78fa142d7a65d666567bc5551';

export default {
    access_token: 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG',
}

import { notion } from "./notion";

export interface IPath {
    path: string;
    subcategory: string;
    category: string;
    defaultValue: number;
    customName: boolean;
    nameInApp: string;
    lifecost: boolean;
    defaultName: string;
}

export async function loadPathsFromNotion(): Promise<IPath[]> {
    // get IPath items from Notion table
    const response = await notion.databases.query({
        database_id: pathsDatabaseId,
    });

    const paths = response.results.map((page: any) => {
        const defaultValue = page.properties.defaultValue.number;
        const nameInApp = page.properties.nameInApp.rich_text;
        const subcategory = page.properties.subcategory.rich_text;
        const category = page.properties.category.rich_text;
        const defaultName = page.properties.defaultName.rich_text;

        return {
            path: page.properties.Path.title[0].plain_text,
            customName: page.properties.customName.checkbox,
            defaultValue: defaultValue ? defaultValue : null,
            nameInApp: nameInApp.length > 0 ? nameInApp[0].plain_text : null,
            subcategory: subcategory.length > 0 ? subcategory[0].plain_text : null,
            category: category.length > 0 ? category[0].plain_text : null,
            lifecost: page.properties.lifecost.checkbox,
            defaultName: defaultName.length > 0 ? defaultName[0].plain_text : null
        } as IPath;
    }
    );

    return paths;
}