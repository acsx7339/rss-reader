import { describe, expect, it } from "vitest"
import MockDate from "mockdate"

describe("parseRelativeDate", () => {
  Object.assign(process.env, { TZ: "UTC" })
  const second = 1000
  const minute = 60 * second
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  const date = new Date()

  const weekday = (d: number) => +new Date(date.getFullYear(), date.getMonth(), date.getDate() + d - (date.getDay() > d ? date.getDay() : date.getDay() + 7))

  // 固定時間
  MockDate.set(date)

  it("s秒鐘前", () => {
    expect(+new Date(parseRelativeDate("10秒前"))).toBe(+date - 10 * second)
  })

  it("m分鐘前", () => {
    expect(+new Date(parseRelativeDate("10分鐘前"))).toBe(+date - 10 * minute)
  })

  it("m分鐘前", () => {
    expect(+new Date(parseRelativeDate("10分鐘前"))).toBe(+date - 10 * minute)
  })

  it("m分鐘後", () => {
    expect(+new Date(parseRelativeDate("10分鐘後"))).toBe(+date + 10 * minute)
  })

  it("a minute ago", () => {
    expect(+new Date(parseRelativeDate("a minute ago"))).toBe(+date - 1 * minute)
  })

  it("s minutes ago", () => {
    expect(+new Date(parseRelativeDate("10 minutes ago"))).toBe(+date - 10 * minute)
  })

  it("s mins ago", () => {
    expect(+new Date(parseRelativeDate("10 mins ago"))).toBe(+date - 10 * minute)
  })

  it("in s minutes", () => {
    expect(+new Date(parseRelativeDate("in 10 minutes"))).toBe(+date + 10 * minute)
  })

  it("in an hour", () => {
    expect(+new Date(parseRelativeDate("in an hour"))).toBe(+date + 1 * hour)
  })

  it("h小時前", () => {
    expect(+new Date(parseRelativeDate("10小時前"))).toBe(+date - 10 * hour)
  })

  it("h個小時前", () => {
    expect(+new Date(parseRelativeDate("10個小時前"))).toBe(+date - 10 * hour)
  })

  it("d天前", () => {
    expect(+new Date(parseRelativeDate("10天前"))).toBe(+date - 10 * day)
  })

  it("w周前", () => {
    expect(+new Date(parseRelativeDate("10周前"))).toBe(+date - 10 * week)
  })

  it("w星期前", () => {
    expect(+new Date(parseRelativeDate("10星期前"))).toBe(+date - 10 * week)
  })

  it("w個星期前", () => {
    expect(+new Date(parseRelativeDate("10個星期前"))).toBe(+date - 10 * week)
  })

  it("m月前", () => {
    expect(+new Date(parseRelativeDate("1月前"))).toBe(+date - 1 * month)
  })

  it("m個月前", () => {
    expect(+new Date(parseRelativeDate("1個月前"))).toBe(+date - 1 * month)
  })

  it("y年前", () => {
    expect(+new Date(parseRelativeDate("1年前"))).toBe(+date - 1 * year)
  })

  it("y年M個月前", () => {
    expect(+new Date(parseRelativeDate("1年1個月前"))).toBe(+date - 1 * year - 1 * month)
  })

  it("d天H小時前", () => {
    expect(+new Date(parseRelativeDate("1天1小時前"))).toBe(+date - 1 * day - 1 * hour)
  })

  it("h小時m分鐘s秒鐘前", () => {
    expect(+new Date(parseRelativeDate("1小時1分鐘1秒鐘前"))).toBe(+date - 1 * hour - 1 * minute - 1 * second)
  })

  it("dd Hh mm ss ago", () => {
    expect(+new Date(parseRelativeDate("1d 1h 1m 1s ago"))).toBe(+date - 1 * day - 1 * hour - 1 * minute - 1 * second)
  })

  it("h小時m分鐘s秒鐘後", () => {
    expect(+new Date(parseRelativeDate("1小時1分鐘1秒鐘後"))).toBe(+date + 1 * hour + 1 * minute + 1 * second)
  })

  it("今天", () => {
    expect(+new Date(parseRelativeDate("今天"))).toBe(+date.setHours(0, 0, 0, 0))
  })

  it("today H:m", () => {
    expect(+new Date(parseRelativeDate("Today 08:00"))).toBe(+date + 8 * hour)
  })

  it("today, h:m a", () => {
    expect(+new Date(parseRelativeDate("Today, 8:00 pm"))).toBe(+date + 20 * hour)
  })

  it("tDA H:m:s", () => {
    expect(+new Date(parseRelativeDate("TDA 08:00:00"))).toBe(+date + 8 * hour)
  })

  it("今天 H:m", () => {
    expect(+new Date(parseRelativeDate("今天 08:00"))).toBe(+date + 8 * hour)
  })

  it("今天H點m分", () => {
    expect(+new Date(parseRelativeDate("今天8點0分"))).toBe(+date + 8 * hour)
  })

  it("昨日H點m分s秒", () => {
    expect(+new Date(parseRelativeDate("昨日20時0分0秒"))).toBe(+date - 4 * hour)
  })

  it("前天 H:m", () => {
    expect(+new Date(parseRelativeDate("前天 20:00"))).toBe(+date - 1 * day - 4 * hour)
  })

  it("明天 H:m", () => {
    expect(+new Date(parseRelativeDate("明天 20:00"))).toBe(+date + 1 * day + 20 * hour)
  })

  it("星期幾 h:m", () => {
    expect(+new Date(parseRelativeDate("星期一 8:00"))).toBe(weekday(1) + 8 * hour)
  })

  it("周幾 h:m", () => {
    expect(+new Date(parseRelativeDate("周二 8:00"))).toBe(weekday(2) + 8 * hour)
  })

  it("星期天 h:m", () => {
    expect(+new Date(parseRelativeDate("星期天 8:00"))).toBe(weekday(7) + 8 * hour)
  })

  it("invalid", () => {
    expect(parseRelativeDate("RSSHub")).toBe("RSSHub")
  })
})

describe("transform Beijing time to UTC in different timezone", () => {
  const a = "2024/10/3 12:26:16"
  const b = 1727929576000
  it("in UTC", () => {
    Object.assign(process.env, { TZ: "UTC" })
    const date = tranformToUTC(a)
    expect(date).toBe(b)
  })

  it("in Beijing", () => {
    Object.assign(process.env, { TZ: "Asia/Shanghai" })
    const date = tranformToUTC(a)
    expect(date).toBe(b)
  })

  it("in New York", () => {
    Object.assign(process.env, { TZ: "America/New_York" })
    const date = tranformToUTC(a)
    expect(date).toBe(b)
  })
})
