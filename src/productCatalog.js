const products = {
  "SKU-APPLE": {
    sku: "SKU-APPLE",
    name: "Apple Box",
    unitPrice: 300
  },
  "SKU-BANANA": {
    sku: "SKU-BANANA",
    name: "Banana Pack",
    unitPrice: 200
  },
  "SKU-COFFEE": {
    sku: "SKU-COFFEE",
    name: "Coffee Beans",
    unitPrice: 1200
  }
};

function getProduct(sku) {
  return products[sku] || null;
}

function listProducts() {
  return Object.values(products);
}

module.exports = {
  getProduct,
  listProducts
};
