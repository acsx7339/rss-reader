const moneyUdn = defineRSSSource("https://money.udn.com/rssfeed/news/1001/5590/5607?ch=money")

export default defineSource({
  "money-udn": moneyUdn,
  "money-udn-twstock": moneyUdn
})
