import * as S from 'parser-ts/lib/string'
import * as F from 'fp-ts/lib/function'

export const parse = S.int

export const serialize = F.identity
export const deserialize = F.identity