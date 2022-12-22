import TE from "fp-ts/TaskEither";
import type {IO} from "fp-ts/IO";
import type {Option} from "fp-ts/Option";

export type Row = {
    readonly [key: string]: number | string | null
}

export type Table = readonly Row[]

export type DBData = {
    readonly [key: string]: Table
}

export type DB = {
    getRawData: IO<DBData>,
    saveDB: TE.TaskEither<Error, void>,
    get: (path, ...args) => Option<DBData | Table | Row>,
    set: (path, ...args) => TE.TaskEither<Error, DB>
}