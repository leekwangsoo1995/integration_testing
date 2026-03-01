const assert = require("node:assert/strict");

const paymentGateway = require("../src/clients/paymentGateway");
const { getProduct } = require("../src/productCatalog");
const orderService = require("../src/services/orderService");

const tests = [
  {
    name: "productCatalog returns a known product",
    run() {
      const product = getProduct("SKU-APPLE");

      assert.deepEqual(product, {
        sku: "SKU-APPLE",
        name: "Apple Box",
        unitPrice: 300
      });
    }
  },
  {
    name: "paymentGateway returns declined for DECLINED_CARD",
    run() {
      const result = paymentGateway.charge({
        paymentMethod: "DECLINED_CARD"
      });

      assert.deepEqual(result, {
        approved: false,
        code: "CARD_DECLINED"
      });
    }
  },
  {
    name: "paymentGateway throws timeout error for GATEWAY_TIMEOUT",
    run() {
      assert.throws(
        () => {
          paymentGateway.charge({
            paymentMethod: "GATEWAY_TIMEOUT"
          });
        },
        (error) => error.code === "GATEWAY_TIMEOUT"
      );
    }
  },
  {
    name: "orderService rejects an invalid quantity before any side effects",
    run() {
      assert.throws(
        () => {
          orderService.createOrder({
            customerId: "CUST-001",
            sku: "SKU-APPLE",
            quantity: 0,
            paymentMethod: "CARD"
          });
        },
        (error) => error.statusCode === 400 && error.code === "INVALID_QUANTITY"
      );
    }
  }
];

let passed = 0;

for (const entry of tests) {
  try {
    entry.run();
    passed += 1;
    console.log(`PASS: ${entry.name}`);
  } catch (error) {
    console.error(`FAIL: ${entry.name}`);
    console.error(error.stack || error);
    process.exit(1);
  }
}

console.log(`${passed}/${tests.length} unit tests passed`);
