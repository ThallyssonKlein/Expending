"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notion = void 0;
const config_1 = __importDefault(require("./config"));
const { Client } = require("@notionhq/client");
exports.notion = new Client({
    auth: config_1.default.access_token,
});
