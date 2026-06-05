interface KuaishouRes {
  defaultClient: {
    ROOT_QUERY: {
      "visionHotRank({\"page\":\"home\"})": {
        type: string
        id: string
        typename: string
      }
      [key: string]: any
    }
    [key: string]: any
  }
}

interface HotRankData {
  result: number
  pcursor: string
  webPageArea: string
  items: {
    type: string
    generated: boolean
    id: string
    typename: string
  }[]
}

export default defineSource(async () => {
  // 獲取快手首頁HTML
  const html = await myFetch("https://www.kuaishou.com/?isHome=1")
  // 提取window.__APOLLO_STATE__中的資料
  const matches = (html as string).match(/window\.__APOLLO_STATE__\s*=\s*(\{.+?\});/)
  if (!matches) {
    throw new Error("無法獲取快手熱榜資料")
  }

  // 解析JSON資料
  const data: KuaishouRes = JSON.parse(matches[1])

  // 獲取熱榜資料ID
  const hotRankId = data.defaultClient.ROOT_QUERY["visionHotRank({\"page\":\"home\"})"].id

  // 獲取熱榜列表資料
  const hotRankData = data.defaultClient[hotRankId] as HotRankData
  // 轉換資料格式
  return hotRankData.items.filter(k => data.defaultClient[k.id].tagType !== "置頂").map((item) => {
    // 從id中提取實際的熱搜詞
    const hotSearchWord = item.id.replace("VisionHotRankItem:", "")

    // 獲取具體的熱榜項資料
    const hotItem = data.defaultClient[item.id]

    return {
      id: hotSearchWord,
      title: hotItem.name,
      url: `https://www.kuaishou.com/search/video?searchKey=${encodeURIComponent(hotItem.name)}`,
      extra: {
        icon: hotItem.iconUrl,
      },
    }
  })
})
