import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../db/schema/auth'
export { sql, eq, and, or } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

