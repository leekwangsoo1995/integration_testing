# integration-testing-demo
結合テスト設計デモ向けに作った、最小構成の注文登録APIです。  

## 起動

```bash
npm start
```

## すぐ試す

```bash
curl http://localhost:3000/api/products
```

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST-001","sku":"SKU-APPLE","quantity":2,"paymentMethod":"CARD"}'
```

仕様は `docs/api-spec.md`、外部API契約は `docs/external-payment-api-spec.md`、結合テスト観点は `docs/test-design-notes.md` を参照。

5分デモの進め方は `docs/demo-scenario.md` にまとめています。
