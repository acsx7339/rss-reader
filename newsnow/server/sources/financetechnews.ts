const financetechnews = defineRSSSource("https://finance.technews.tw/feed/")

export default defineSource({
  "finance-technews": financetechnews,
  "finance-technews-latest": financetechnews
})
