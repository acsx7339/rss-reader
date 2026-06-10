interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  // 獲取虎撲新熱榜頁面的HTML內容
  const html = await myFetch(`https://bbs.hupu.com/topic-daily-hot`)

  // 正則表達式匹配新的熱榜項結構
  const regex = /<li class="bbs-sl-web-post-body">[\s\S]*?<a href="(\/[^"]+?\.html)"[^>]*?class="p-title"[^>]*>([^<]+)<\/a>/g

  const result: HotItem[] = []
  let match

  // 將賦值操作移到循環內部，修復no-cond-assign警告
  while (true) {
    match = regex.exec(html)
    if (!match) break

    const [, path, title] = match

    // 構建完整URL
    const url = `https://bbs.hupu.com${path}`

    result.push({
      id: path,
      title: title.trim(),
      url,
      mobileUrl: url,
    })
  }

  return result
})
