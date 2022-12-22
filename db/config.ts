import type {DBConfig} from "./internal/dbConfig";

// const projectFolder = new URL('./internal/data', import.meta.url);
const projectFolder = './dist/db/internal/data'

export default {
    DB_DATA_DIR: projectFolder,
    DB_NAME: 'db',
} as DBConfig