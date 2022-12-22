import {mkdir, writeContentsToFile} from "./utils";
import type {DBConfig} from "./dbConfig";
import TE from "fp-ts/TaskEither";

export default (config: DBConfig) => (..._args: any[]) =>
    TE.match(
        (e) => {
            throw e
        },
        writeContentsToFile(`${config.DB_DATA_DIR}/${config.DB_NAME}.json`)(JSON.stringify({}))
    )(mkdir(config.DB_DATA_DIR))
