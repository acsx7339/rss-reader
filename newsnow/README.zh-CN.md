![](/public/og-image.png)

[English](./README.md) | 簡體中文 | [日本語](README.ja-JP.md)

***優雅地閱讀實時熱門新聞***

> [!NOTE]
> 當前版本爲 DEMO，僅支援中文。正式版將提供更好的定製化功能和英文內容支援。
>

## 功能特性
- 優雅的閱讀界面設計，實時獲取最新熱點新聞
- 支援 GitHub 登入及資料同步
- 預設快取時長爲 30 分鐘，登入使用者可強制重新整理獲取最新資料
- 根據內容源更新頻率動態調整抓取間隔（最快每 2 分鐘），避免頻繁抓取導致 IP 被封禁
- 支援 MCP server

```json
{
  "mcpServers": {
    "newsnow": {
      "command": "npx",
      "args": [
        "-y",
        "newsnow-mcp-server"
      ],
      "env": {
        "BASE_URL": "https://newsnow.busiyi.world"
      }
    }
  }
}
```

你可以將 `BASE_URL` 修改爲你的域名。

## 部署指南

### 基礎部署
無需登入和快取功能時，可直接部署至 Cloudflare Pages 或 Vercel：
1. Fork 本倉庫
2. 匯入至目標平臺

### Cloudflare Pages 設定
- 構建命令：`pnpm run build`
- 輸出目錄：`dist/output/public`

### GitHub OAuth 設定
1. [創建 GitHub App](https://github.com/settings/applications/new)
2. 無需特殊權限
3. 回調 URL 設置爲：`https://your-domain.com/api/oauth/github`（替換 your-domain 爲實際域名）
4. 獲取 Client ID 和 Client Secret

### 環境變量設定
參考 `example.env.server` 文件，本地運行時重命名爲 `.env.server` 並填寫以下設定：

```env
# Github Clien ID
G_CLIENT_ID=
# Github Clien Secret
G_CLIENT_SECRET=
# JWT Secret, 通常就用 Clien Secret
JWT_SECRET=
# 初始化資料庫, 首次運行必須設置爲 true，之後可以將其關閉
INIT_TABLE=true
# 是否啓用快取
ENABLE_CACHE=true
```

### 資料庫支援
本項目主推 Cloudflare Pages 以及 Docker 部署， Vercel 需要你自行搞定資料庫，其他支援的資料庫可以查看 https://db0.unjs.io/connectors 。

1. 在 Cloudflare Worker 控制面板創建 D1 資料庫
2. 在 `wrangler.toml` 中設定 `database_id` 和 `database_name`
3. 若無 `wrangler.toml` ，可將 `example.wrangler.toml` 重命名並修改設定
4. 重新部署生效

### Docker 部署
對於 Docker 部署，只需要項目根目錄 `docker-compose.yaml` 文件，同一目錄下執行
```
docker compose up
```
同樣可以通過 `docker-compose.yaml` 設定環境變量。

## 開發
> [!Note]
> 需要 Node.js >= 20

```bash
corepack enable
pnpm i
pnpm dev
```

你可能想要添加資料源，請關注 `shared/sources` `server/sources`，項目類型完備，結構簡單，請自行探索。

## 路線圖
- 添加 **多語言支援**（英語、中文，更多語言即將推出）
- 改進 **個性化選項**（基於分類的新聞、儲存的偏好設置）
- 擴展 **資料源** 以涵蓋多種語言的全球新聞

## 貢獻指南
歡迎貢獻代碼！您可以提交 pull request 或創建 issue 來提出功能請求和報告 bug

## License

[MIT](./LICENSE) © ourongxing

## 讚賞
如果本項目對你有所幫助，可以給小貓買點零食。如果需要定製或者其他幫助，請通過下列方式聯繫備註。

![](./screenshots/reward.gif)

<a href="https://hellogithub.com/repository/c2978695e74a423189e9ca2543ab3b36" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=c2978695e74a423189e9ca2543ab3b36&claim_uid=SMJiFwlsKCkWf89&theme=small" alt="Featured｜HelloGitHub" /></a>
