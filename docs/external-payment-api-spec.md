# 外部Payment API仕様書（デモ用）
このドキュメントは、注文APIが依存する外部決済サービスの契約を定義しています。
デモ用のため、外部Payment APIそのものの実装はこのリポジトリには置かず、API仕様書だけを用意する前提です。

## 1. 位置づけ
- 呼び出し元: 注文アプリの `OrderService`
- 呼び出し経路: `OrderService -> src/clients/paymentGateway.js -> 外部Payment API`
- デモ上の狙い:
  - 内部モジュール依存だけでなく、外部API依存も読ませられるようにする
  - 結合テスト設計で「外部APIの契約をどこまで検証するか」を議論しやすくする

## 2. API概要

### `POST /payments`

注文金額に対して決済を実行します。

想定ベースURL:

`https://payment.example.test`

## 3. リクエスト仕様

ヘッダー:

- `Content-Type: application/json`
- `X-Request-Id: <trace id>`

リクエストボディ:

```json
{
  "orderRef": "ORD-001",
  "customerId": "CUST-001",
  "amount": 600,
  "currency": "JPY",
  "method": "CARD"
}
```

項目:

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `orderRef` | string | 必須 | 呼び出し元の注文識別子 |
| `customerId` | string | 必須 | 顧客ID |
| `amount` | number | 必須 | 決済金額 |
| `currency` | string | 必須 | 通貨。今回のデモでは `JPY` 固定 |
| `method` | string | 必須 | 決済手段 |

## 4. レスポンス仕様

### 4-1. 承認

HTTP `200`

```json
{
  "status": "APPROVED",
  "paymentId": "PAY-001"
}
```

### 4-2. 業務的拒否

HTTP `200`

```json
{
  "status": "DECLINED",
  "reasonCode": "CARD_DECLINED"
}
```

ポイント:

- HTTPとしては成功でも、業務上は失敗のケース
- 結合テストでは「HTTP 200 なら成功」と誤判定しない設計が必要

### 4-3. タイムアウト

期待動作:

- 3秒以内に応答がなければ呼び出し元はタイムアウト扱い
- 呼び出し元は注文確定を中止し、在庫をロールバックする

## 5. デモ用の疑似挙動

このリポジトリでは外部Payment API本体は実装しません。  
代わりに `src/clients/paymentGateway.js` が以下のように応答を擬似再現します。

| `method` 相当の値 | 擬似結果 |
| --- | --- |
| `CARD` | 承認 |
| `DECLINED_CARD` | 業務的拒否 |
| `GATEWAY_TIMEOUT` | タイムアウト例外 |

## 6. 結合テスト設計で見たい観点

- 外部API呼び出しが必要な条件でのみ実行されるか
- 業務的拒否を正しく失敗として扱えるか
- タイムアウト時に注文保存を中止できるか
- タイムアウト時に在庫を元に戻せるか
- 外部APIの契約変更（レスポンス項目不足など）に弱い箇所はどこか
