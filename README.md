# jp-holiday-api

Cloudflare Workers + Hono で動く、日本の祝日と営業日判定を返す小さな JSON API。
祝日データは外部 API / DB を使わず `src/holidays.ts` に定数として保持している（2025年・2026年）。

**本番 URL: https://jp-holiday-api.nanotool.workers.dev**

```sh
curl 'https://jp-holiday-api.nanotool.workers.dev/v1/is-business-day?date=2026-08-17'
```

CORS は全オリジン許可（`Access-Control-Allow-Origin: *`）なので、ブラウザから直接 fetch できる。

## セットアップ

```sh
npm install
```

## ローカル起動

```sh
npm run dev      # http://localhost:8787
```

## デプロイ

```sh
npx wrangler login   # 初回のみ
npm run deploy
```

デプロイ先は `https://jp-holiday-api.nanotool.workers.dev`（workers.dev サブドメイン `nanotool` に登録済み）。

初回セットアップでハマりやすい点:

- `[code: 10034]` が出る場合は Cloudflare アカウントのメールアドレスが未確認。確認後に再実行する。
- `You need to register a workers.dev subdomain` が出る場合は、ダッシュボードの Workers & Pages → Subdomain でサブドメインを登録する（アカウントに一度だけ）。登録後は再デプロイ不要で、DNS 伝播に数分かかる。

### ログを見る

```sh
npx wrangler tail
```

`wrangler.jsonc` で `observability.enabled` を有効にしてあるため、以下が見える:

- リクエストのメソッド・パス・レスポンスステータス
- ハンドラ内の `console.log` / `console.error`
- 未捕捉例外のスタックトレース（`src/lib/errors.ts` の `onErrorHandler` が出力する。クライアントには `INTERNAL_ERROR` しか返さないので、原因はここでしか読めない）

## テスト / 型チェック

```sh
npm test
npm run typecheck
```

## エンドポイント

### GET /v1/holidays?year=2026

指定年の祝日一覧（date 昇順）。

```sh
curl 'http://localhost:8787/v1/holidays?year=2026'
```

```json
{
  "year": 2026,
  "count": 18,
  "holidays": [
    { "date": "2026-01-01", "name": "元日" },
    { "date": "2026-01-12", "name": "成人の日" }
  ]
}
```

### GET /v1/is-business-day?date=2026-08-17

土日・祝日を除いた営業日かどうかを判定する。日付は UTC 基準で扱う。

```sh
curl 'http://localhost:8787/v1/is-business-day?date=2026-08-17'
```

```json
{
  "date": "2026-08-17",
  "isBusinessDay": true,
  "weekday": "Mon",
  "isWeekend": false,
  "isHoliday": false,
  "holidayName": null
}
```

## エラー

```json
{ "error": { "code": "INVALID_PARAMETER", "message": "year is required" } }
```

| code | HTTP | 発生条件 |
| --- | --- | --- |
| `INVALID_PARAMETER` | 400 | パラメータ欠落、または `YYYY`/`YYYY-MM-DD` として不正 |
| `NOT_FOUND` | 404 | 未定義のエンドポイント |
| `INTERNAL_ERROR` | 500 | 予期しない例外（詳細は `wrangler tail` で確認する） |
| `YEAR_NOT_SUPPORTED` | 404 | 祝日データを持たない年（2025・2026 以外） |

上 3 つは全API共通のコード、`YEAR_NOT_SUPPORTED` はこの API 固有。
体系は [`../docs/TEMPLATE.md`](../docs/TEMPLATE.md) を参照。

## 祝日データの更新

`src/holidays.ts` の `HOLIDAYS` に年をキーとした配列を追加するだけでよい。
`SUPPORTED_YEARS` も合わせて更新すること（エラーメッセージの範囲表示に使う）。

## 構成

```
src/
  index.ts          HTTP層（ルーティング）
  schema.ts         Zod スキーマ
  appErrors.ts      このAPI固有のエラーコード
  holidays.ts       祝日データ
  businessDay.ts    営業日判定ロジック
  lib/              次のAPIへそのままコピーする汎用層
```

このリポジトリは「小さな JSON API を量産するためのテンプレート」の 1 本目でもある。
構成の意図と 2 本目の作り方は [`../docs/TEMPLATE.md`](../docs/TEMPLATE.md) に書いてある。
