# integration-testing-demo
結合テスト設計デモ向けに作った、最小構成の注文登録APIです。  
POST /api/orders を受けたら、商品を確認し、在庫を引き当て、決済し、成功したら注文を保存します。
一部の単体テストのみ実装済み。結合テストは未実装。


# 各モジュールの役割は次の通りです。

src/server.js
HTTPの受付とJSON入出力だけを担当

src/services/orderService.js
業務フローの中心。注文処理を順番にまとめる

src/productCatalog.js
商品マスタを返す

src/repositories/inventoryRepository.js
在庫確認、引当、戻しを担当

src/repositories/orderRepository.js
注文保存と取得を担当

src/clients/paymentGateway.js
外部Payment APIを呼ぶための内部アダプタ。デモでは本物の外部通信はせず、挙動だけ再現

## 起動
```bash
npm start
```

```bash
curl http://localhost:3000/api/products
```

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST-001","sku":"SKU-APPLE","quantity":2,"paymentMethod":"CARD"}'
```

外部APIdocは `docs/external-payment-api-spec.md`を参照。