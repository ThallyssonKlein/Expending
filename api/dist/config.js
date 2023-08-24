"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPathsFromNotion = void 0;
const pathsDatabaseId = '17139f87807640ad8ac55b8bf0f27e3b';
exports.default = {
    access_token: 'secret_NkGYvmWZ6e0o9Z7CgVys4QDYWuUHkv7wFm3hGVUFycG',
};
const notion_1 = require("./notion");
function loadPathsFromNotion() {
    return __awaiter(this, void 0, void 0, function* () {
        // get IPath items from Notion table
        const response = yield notion_1.notion.databases.query({
            database_id: pathsDatabaseId,
        });
        const paths = response.results.map((page) => {
            const defaultValue = page.properties.defaultValue.number;
            const relation_id = page.properties.relation_id.rich_text;
            const relation_name = page.properties.relation_name.rich_text;
            return {
                path: page.properties.Path.title[0].plain_text,
                databaseId: page.properties.databaseId.rich_text[0].plain_text,
                customName: page.properties.customName.checkbox,
                relation_name: relation_name.length > 0 ? relation_name[0].plain_text : null,
                relation_id: relation_id.length > 0 ? relation_id[0].plain_text : null,
                defaultValue: defaultValue ? defaultValue : null
            };
        });
        return paths;
    });
}
exports.loadPathsFromNotion = loadPathsFromNotion;
