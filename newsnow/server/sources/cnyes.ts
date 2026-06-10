interface Res {
  items: {
    data: {
      newsId: number
      title: string
      publishAt: number
      newsUrl?: string
    }[]
  }
}

export default defineSource(async () => {
  const url = "https://news.cnyes.com/api/v3/news/category/tw_stock?limit=30"
  const res = await myFetch<Res>(url)
  return res.items.data.map(item => ({
    id: String(item.newsId),
    title: item.title,
    url: `https://news.cnyes.com/news/id/${item.newsId}`,
    pubDate: item.publishAt * 1000,
  }))
})
