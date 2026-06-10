const yahoo = defineRSSSource("https://tw.news.yahoo.com/rss/finance")

export default defineSource({
  "yahoo-finance-tw": yahoo,
  "yahoo-finance-tw-news": yahoo
})
