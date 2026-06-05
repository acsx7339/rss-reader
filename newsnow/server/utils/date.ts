import dayjs from "dayjs/esm"
import utcPlugin from "dayjs/esm/plugin/utc"
import timezonePlugin from "dayjs/esm/plugin/timezone"
import customParseFormat from "dayjs/esm/plugin/customParseFormat"
import duration from "dayjs/esm/plugin/duration"
import isSameOrBefore from "dayjs/esm/plugin/isSameOrBefore"
import weekday from "dayjs/esm/plugin/weekday"

dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
dayjs.extend(isSameOrBefore)
dayjs.extend(weekday)

/**
 * 傳入任意時區的時間（不攜帶時區），轉換爲 UTC 時間
 */
export function tranformToUTC(date: string, format?: string, timezone: string = "Asia/Shanghai"): number {
  if (!format) return dayjs.tz(date, timezone).valueOf()
  return dayjs.tz(date, format, timezone).valueOf()
}

// cloudflare 裏 dayjs() 結果爲 0，不能放在 top
function words() {
  return [
    {
      startAt: dayjs(),
      regExp: /^(?:今[天日]|to?day?)(.*)/,
    },
    {
      startAt: dayjs().subtract(1, "days"),
      regExp: /^(?:昨[天日]|y(?:ester)?day?)(.*)/,
    },
    {
      startAt: dayjs().subtract(2, "days"),
      regExp: /^(?:前天|(?:the)?d(?:ay)?b(?:eforeyesterda)?y)(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(1)) ? dayjs().weekday(1).subtract(1, "week") : dayjs().weekday(1),
      regExp: /^(?:周|星期)一(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(2)) ? dayjs().weekday(2).subtract(1, "week") : dayjs().weekday(2),
      regExp: /^(?:周|星期)二(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(3)) ? dayjs().weekday(3).subtract(1, "week") : dayjs().weekday(3),
      regExp: /^(?:周|星期)三(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(4)) ? dayjs().weekday(4).subtract(1, "week") : dayjs().weekday(4),
      regExp: /^(?:周|星期)四(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(5)) ? dayjs().weekday(5).subtract(1, "week") : dayjs().weekday(5),
      regExp: /^(?:周|星期)五(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(6)) ? dayjs().weekday(6).subtract(1, "week") : dayjs().weekday(6),
      regExp: /^(?:周|星期)六(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(7)) ? dayjs().weekday(7).subtract(1, "week") : dayjs().weekday(7),
      regExp: /^(?:周|星期)[天日](.*)/,
    },
    {
      startAt: dayjs().add(1, "days"),
      regExp: /^(?:明[天日]|y(?:ester)?day?)(.*)/,
    },
    {
      startAt: dayjs().add(2, "days"),
      regExp: /^(?:[後後][天日]|(?:the)?d(?:ay)?a(?:fter)?t(?:omrrow)?)(.*)/,
    },
  ]
}

const patterns = [
  {
    unit: "years",
    regExp: /(\d+)(?:年|y(?:ea)?rs?)/,
  },
  {
    unit: "months",
    regExp: /(\d+)(?:[個個]?月|months?)/,
  },
  {
    unit: "weeks",
    regExp: /(\d+)(?:周|[個個]?星期|weeks?)/,
  },
  {
    unit: "days",
    regExp: /(\d+)(?:天|日|d(?:ay)?s?)/,
  },
  {
    unit: "hours",
    regExp: /(\d+)(?:[個個]?(?:小?時|[時點點])|h(?:(?:ou)?r)?s?)/,
  },
  {
    unit: "minutes",
    regExp: /(\d+)(?:分[鐘鍾]?|m(?:in(?:ute)?)?s?)/,
  },
  {
    unit: "seconds",
    regExp: /(\d+)(?:秒[鐘鍾]?|s(?:ec(?:ond)?)?s?)/,
  },
]

const patternSize = Object.keys(patterns).length

/**
 * 預處理日期字符串
 * @param {string} date 原始日期字符串
 */
function toDate(date: string) {
  return date
    .toLowerCase()
    .replace(/(^an?\s)|(\san?\s)/g, "1") // 替換 `a` 和 `an` 爲 `1`
    .replace(/幾|幾/g, "3") // 如 `幾秒鐘前` 視作 `3秒鐘前`
    .replace(/[\s,]/g, "")
} // 移除所有空格

/**
 * 將 `['\d+時', ..., '\d+秒']` 轉換爲 `{ hours: \d+, ..., seconds: \d+ }`
 * 用於描述時間長度
 * @param {Array.<string>} matches 所有匹配結果
 */
function toDurations(matches: string[]) {
  const durations: Record<string, string> = {}

  let p = 0
  for (const m of matches) {
    for (; p <= patternSize; p++) {
      const match = patterns[p].regExp.exec(m)
      if (match) {
        durations[patterns[p].unit] = match[1]
        break
      }
    }
  }
  return durations
}

export const parseDate = (date: string | number, ...options: any) => dayjs(date, ...options).toDate()

export function parseRelativeDate(date: string, timezone: string = "UTC") {
  if (date === "剛剛") return new Date()
  // 預處理日期字符串 date

  const theDate = toDate(date)

  // 將 `\d+年\d+月...\d+秒前` 分割成 `['\d+年', ..., '\d+秒前']`

  const matches = theDate.match(/\D*\d+(?![:\-/]|(a|p)m)\D+/g)
  const offset = dayjs.duration({ hours: (dayjs().tz(timezone).utcOffset() - dayjs().utcOffset()) / 60 })

  if (matches) {
    // 獲得最後的時間單元，如 `\d+秒前`

    const lastMatch = matches.pop()

    if (lastMatch) {
      // 若最後的時間單元含有 `前`、`以前`、`之前` 等標識字段，減去相應的時間長度
      // 如 `1分10秒前`

      const beforeMatches = /(.*)(?:前|ago)$/.exec(lastMatch)
      if (beforeMatches) {
        matches.push(beforeMatches[1])
        // duration 這個插件有 bug，他會重新實現 subtract 這個方法，並且不會處理 weeks。用 ms 就可以調用預設的方法
        return dayjs().subtract(dayjs.duration(toDurations(matches))).toDate()
      }

      // 若最後的時間單元含有 `後`、`以後`、`之後` 等標識字段，加上相應的時間長度
      // 如 `1分10秒後`

      const afterMatches = /(?:^in(.*)|(.*)[後後])$/.exec(lastMatch)
      if (afterMatches) {
        matches.push(afterMatches[1] ?? afterMatches[2])
        return dayjs()
          .add(dayjs.duration(toDurations(matches)))
          .toDate()
      }

      // 以下處理日期字符串 date 含有特殊詞的情形
      // 如 `今天1點10分`

      matches.push(lastMatch)
    }
    const firstMatch = matches.shift()

    if (firstMatch) {
      for (const w of words()) {
        const wordMatches = w.regExp.exec(firstMatch)
        if (wordMatches) {
          matches.unshift(wordMatches[1])

          // 取特殊詞對應日零時爲起點，加上相應的時間長度

          return dayjs.tz(w.startAt
            .set("hour", 0)
            .set("minute", 0)
            .set("second", 0)
            .set("millisecond", 0)
            .add(dayjs.duration(toDurations(matches)))
            .add(offset), timezone)
            .toDate()
        }
      }
    }
  } else {
    // 若日期字符串 date 不匹配 patterns 中所有模式，則預設爲 `特殊詞 + 標準時間格式` 的情形，此時直接將特殊詞替換爲對應日期
    // 如今天爲 `2022-03-22`，則 `今天 20:00` => `2022-03-22 20:00`

    for (const w of words()) {
      const wordMatches = w.regExp.exec(theDate)
      if (wordMatches) {
        // The default parser of dayjs() can parse '8:00 pm' but not '8:00pm'
        // so we need to insert a space in between
        return dayjs.tz(`${w.startAt.add(offset).format("YYYY-MM-DD")} ${/a|pm$/.test(wordMatches[1]) ? wordMatches[1].replace(/a|pm/, " $&") : wordMatches[1]}`, timezone).toDate()
      }
    }
  }

  return date
}
