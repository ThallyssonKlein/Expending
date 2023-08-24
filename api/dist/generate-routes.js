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
const config_1 = require("./config");
const notion_1 = require("./notion");
function today() {
    const hoje = new Date();
    const dia = hoje.getDate().toString().padStart(2, '0');
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
}
function isoToday(date) {
    let agora;
    if (date) {
        agora = new Date(date);
    }
    else {
        agora = new Date();
    }
    const offset = -3 * 60;
    return new Date(agora.getTime() + offset * 60 * 1000).toISOString();
}
function buildValor(valor, path) {
    if (!valor && !path.defaultValue)
        throw new Error('Informe um valor!');
    return {
        Valor: {
            type: "number",
            number: valor ? valor : path.defaultValue
        }
    };
}
function buildName(name, path) {
    if (!name && path.customName)
        throw new Error('Informe um nome!');
    return {
        Name: {
            title: [
                {
                    text: {
                        content: name ? name : today(),
                    },
                },
            ],
        },
    };
}
function buildDate(date) {
    return {
        Date: {
            date: {
                start: date ? isoToday(date) : isoToday() + "",
                end: null
            }
        },
    };
}
function buildRelation(path) {
    return {
        [path.relation_name]: {
            "relation": [
                {
                    "id": path.relation_id
                }
            ]
        }
    };
}
function generateRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const paths = yield (0, config_1.loadPathsFromNotion)();
        app.get('/options', (req, res) => {
            const options = [];
            for (const path of paths) {
                options.push({
                    path: path.path,
                    hasDefault: !!path.defaultValue,
                    hasCustomName: !!path.customName
                });
            }
            res.json(options);
        });
        for (const path of paths) {
            app.post(path.path, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                let properties = {};
                try {
                    properties = Object.assign(Object.assign({}, properties), buildValor(body.value, path));
                    properties = Object.assign(Object.assign({}, properties), buildName(body.name, path));
                    properties = Object.assign(Object.assign({}, properties), buildDate(body.date));
                    if (path.relation_id && path.relation_name) {
                        properties = Object.assign(Object.assign({}, properties), buildRelation(path));
                    }
                }
                catch (err) {
                    res.status(400).json({
                        error: err.message
                    });
                    return;
                }
                try {
                    yield notion_1.notion.pages.create({
                        parent: {
                            database_id: path.databaseId,
                        },
                        properties
                    });
                    res.send('ok');
                }
                catch (err) {
                    res.status(400)
                        .json({
                        error: err.message
                    });
                }
            }));
        }
    });
}
module.exports = generateRoutes;
