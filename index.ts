import createDB from "./db/internal/createDB";
import createEntity from "./db/internal/createEntity";
import query from "./db/internal/query";
import config from "./db/config";

const cliCommands = {createDB, createEntity, query}


// declare global {
//     module NodeJS {
//         interface Process {
//             argv: string[]
//         }
//     }
// }

// @ts-ignore
// console.log(cliCommands[process.argv[2]])


// @ts-ignore
console.log(await cliCommands[process.argv[2]](config)(process.argv.slice(3))())

