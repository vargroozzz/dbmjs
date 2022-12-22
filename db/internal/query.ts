import {getDB} from "./utils";
import type {DBConfig} from "./dbConfig";
import TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/function";

export default (config: DBConfig) => ([command, query, ...params]: [string, string, ...any]) => pipe(
    config,
    getDB,
// @ts-ignore
    TE.chain((dbAccessors) => dbAccessors[command](query, ...params))
)


