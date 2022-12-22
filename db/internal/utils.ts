import fsp from 'node:fs/promises';
import TE from "fp-ts/TaskEither";
import E from "fp-ts/Either";
import O from "fp-ts/Option";
import type {Refinement} from "fp-ts/Refinement";
import Ref from "fp-ts/Refinement";
import Pred from "fp-ts/Predicate";
import Rec from "fp-ts/Record";
import Arr from "fp-ts/Array";
import type {DBConfig} from "./dbConfig";
import {flow, pipe} from "fp-ts/function";
import {isString} from "fp-ts/string";
import {get, setOption} from "spectacles-ts";
import type {DB, DBData, Row, Table} from "./index";
import N from "fp-ts/number";

const isNull: Refinement<any, null> = (val): val is null => val === null
const isArray: Refinement<unknown, Array<any>> = (val: unknown): val is Array<any> => Array.isArray(val)
const isObjectOrNull: Refinement<any, object | null> = (val): val is object | null => typeof val === 'object'
const isObject: Refinement<any, object> = Ref.and(isObjectOrNull)(Ref.not(isNull))
const isRecord: Refinement<unknown, Record<string | number | symbol, unknown>> = (val): val is Record<string | number | symbol, unknown> => isObject(val) && !isArray(val)


const isRow: Refinement<unknown, Row> = (json: unknown): json is Row =>
    Ref.compose(Rec.every(Ref.or(Ref.or(isString)(N.isNumber))(isNull)))(isRecord)(json)
const isTable: Refinement<unknown, Table> = (json: unknown): json is Table => Ref.compose(Arr.every(isRow))(isArray)(json)
const isDBData: Refinement<unknown, DBData> = (json: unknown): json is DBData => Ref.compose(Rec.every(isTable))(isRecord)(json)

// const isJsonRecord: Refinement<Json, JsonRecord> = (json): json is JsonRecord =>

export const allowWrite = (path: string) =>
    TE.tryCatch(() => fsp.chmod(path, fsp.constants.S_IRUSR | fsp.constants.S_IWUSR), E.toError);

export const disallowWrite = (path: string) =>
    TE.tryCatch(() => fsp.chmod(path, fsp.constants.S_IRUSR), E.toError);

export const mkdir = (path: string | URL) =>
    TE.tryCatch(() => fsp.mkdir(path, {recursive: true}), E.toError);

export const getFileContents = (path: string) =>
    TE.tryCatch(() => fsp.readFile(path, 'utf-8'), E.toError);

export const writeContentsToFile = (path: string) => (contents: string) =>
    TE.tryCatch(() => fsp.writeFile(path, contents), E.toError);

export const saveDB = (config: DBConfig) => flow(
    E.tryCatchK(
        (x: DBData) => JSON.stringify(x),
        e => e as TypeError,
    ),
    E.filterOrElse(isString, () => new TypeError("Stringify output not a string")),
    TE.fromEither,
    TE.chain(writeContentsToFile(`${config.DB_DATA_DIR}/${config.DB_NAME}.json`)
    ))


// @ts-ignore
const createDBAccessors: (config: DBConfig) => (db: DBData) => DB =
    (config) => (db) => ({
        getRawData: () => db,
        saveDB: saveDB(config)(db),
        // @ts-ignore
        get: (...args) => pipe(
            args,
            // @ts-ignore
            (args) => get(...args)(db),
            (val) => Pred.or(O.isSome)(O.isNone)(val as unknown as O.Option<DBData | Table | Row>) ?
                val as unknown as O.Option<DBData | Table | Row> :
                O.fromNullable(val),
            TE.fromOption(() => new Error('Error while trying to get not existing path')),
        ),
        set: (...args) => pipe(
            args,
            // @ts-ignore
            (args) => setOption(...args)(db),
            (val) => Pred.or(O.isSome)(O.isNone)(val as O.Option<any>) ? val : O.some(val),
            // @ts-ignore
            TE.fromOption(() => new Error('Error while trying to set not existing path')),
            // @ts-ignore
            TE.chainFirst(saveDB(config)),
            TE.map(createDBAccessors(config)),
        ),
    })

export const getDB = (config: DBConfig) =>
    pipe(
        `${config.DB_DATA_DIR}/${config.DB_NAME}.json`,
        getFileContents,
        TE.chain(
            flow(
                E.tryCatchK(
                    (x) => JSON.parse(x),
                    e => e as SyntaxError,
                ),
                E.filterOrElse(
                    isDBData,
                    () => new SyntaxError("The value must be a JSON object")
                ),
                TE.fromEither)
        ),
        TE.map(createDBAccessors(config)))