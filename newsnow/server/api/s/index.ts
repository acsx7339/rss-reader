import type { SourceID, SourceResponse } from "@shared/types"
import { getters } from "#/getters"
import { getCacheTable } from "#/database/cache"
import type { CacheInfo } from "#/types"

export default defineEventHandler(async (event): Promise<SourceResponse> => {
  try {
    const query = getQuery(event)
    const latest = query.latest !== undefined && query.latest !== "false"
    let id = query.id as SourceID
    const isValid = (id: SourceID) => !id || !sources[id] || !getters[id]

    if (isValid(id)) {
      const redirectID = sources?.[id]?.redirect
      if (redirectID) id = redirectID
      if (isValid(id)) throw new Error("Invalid source id")
    }

    const cacheTable = await getCacheTable()
    // Date.now() in Cloudflare Worker will not update throughout the entire runtime.
    const now = Date.now()
    let cache: CacheInfo | undefined
    if (cacheTable) {
      cache = await cacheTable.get(id)
      if (cache) {
      // if (cache) {
        // interval 重新整理間隔，對於快取失效也要執行的。本質上表示本來內容更新就很慢，這個間隔內可能內容壓根不會更新。
        // 預設 10 分鐘，是低於 TTL 的，但部分 Source 的更新間隔會超過 TTL，甚至有的一天更新一次。
        if (now - cache.updated < sources[id].interval) {
          return {
            status: "success",
            id,
            updatedTime: now,
            items: cache.items,
          }
        }

        // 而 TTL 快取失效時間，在時間範圍內，就算內容更新了也要用這個快取。
        // 復用快取是不會更新時間的。
        if (now - cache.updated < TTL) {
          // 有 latest
          // 沒有 latest，但服務器禁止登入

          // 沒有 latest
          // 有 latest，服務器可以登入但沒有登入
          if (!latest || (!event.context.disabledLogin && !event.context.user)) {
            return {
              status: "cache",
              id,
              updatedTime: cache.updated,
              items: cache.items,
            }
          }
        }
      }
    }

    try {
      const newData = (await getters[id]()).slice(0, 30)
      if (cacheTable && newData.length) {
        if (event.context.waitUntil) event.context.waitUntil(cacheTable.set(id, newData))
        else await cacheTable.set(id, newData)
      }
      logger.success(`fetch ${id} latest`)
      return {
        status: "success",
        id,
        updatedTime: now,
        items: newData,
      }
    } catch (e) {
      if (cache!) {
        return {
          status: "cache",
          id,
          updatedTime: cache.updated,
          items: cache.items,
        }
      } else {
        throw e
      }
    }
  } catch (e: any) {
    logger.error(e)
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Internal Server Error",
    })
  }
})
