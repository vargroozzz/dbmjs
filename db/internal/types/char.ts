import * as P from 'parser-ts/lib/Parser'
import * as F from 'fp-ts/lib/function'

export const parse = P.item<string>()

export const serialize = F.identity
export const deserialize = F.identity