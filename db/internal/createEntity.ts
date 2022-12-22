import {getDB} from "./utils";
import type {DBConfig} from "./dbConfig";
import TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/function";

export default (config: DBConfig) => ([name]: any[]) => pipe(
    config,
    getDB,
    TE.chain((dbAccessors) => dbAccessors.set(name, []))
)


