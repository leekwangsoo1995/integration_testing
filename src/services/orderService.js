const { getProduct, listProducts } = require("../productCatalog");
const inventoryRepository = require("../repositories/inventoryRepository");
const orderRepository = require("../repositories/orderRepository");
const paymentGateway = require("../clients/paymentGateway");

function createAppError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw createAppError(400, "INVALID_BODY", "Request body must be a JSON object.");
  }

  if (!payload.customerId || typeof payload.customerId !== "string") {
    throw createAppError(400, "INVALID_CUSTOMER_ID", "customerId is required.");
  }

  if (!Number.isInteger(payload.quantity) || payload.quantity < 1 || payload.quantity > 5) {
    throw createAppError(400, "INVALID_QUANTITY", "quantity must be an integer between 1 and 5.");
  }

  if (!payload.paymentMethod || typeof payload.paymentMethod !== "string") {
    throw createAppError(400, "INVALID_PAYMENT_METHOD", "paymentMethod is required.");
  }
}

function listProductsWithStock() {
  return listProducts().map((product) => ({
    ...product,
    stock: inventoryRepository.getStock(product.sku)
  }));
}

function createOrder(payload) {
  validatePayload(payload);

  const product = getProduct(payload.sku);

  if (!product) {
    throw createAppError(400, "UNKNOWN_SKU", "sku does not exist.");
  }

  const reserved = inventoryRepository.reserve(product.sku, payload.quantity);

  if (!reserved) {
    throw createAppError(409, "OUT_OF_STOCK", "Insufficient stock.");
  }

  let chargeResult;

  try {
    chargeResult = paymentGateway.charge({
      paymentMethod: payload.paymentMethod
    });
  } catch (error) {
    inventoryRepository.release(product.sku, payload.quantity);
    throw createAppError(503, "PAYMENT_GATEWAY_TIMEOUT", "Payment service did not respond.");
  }

  if (!chargeResult.approved) {
    inventoryRepository.release(product.sku, payload.quantity);
    throw createAppError(402, "PAYMENT_DECLINED", "Payment was declined.");
  }

  const order = {
    id: orderRepository.nextId(),
    customerId: payload.customerId,
    sku: product.sku,
    quantity: payload.quantity,
    totalAmount: product.unitPrice * payload.quantity,
    paymentId: chargeResult.paymentId,
    status: "CONFIRMED"
  };

  return orderRepository.save(order);
}

function getOrder(orderId) {
  const order = orderRepository.findById(orderId);

  if (!order) {
    throw createAppError(404, "ORDER_NOT_FOUND", "Order not found.");
  }

  return order;
}

module.exports = {
  createOrder,
  getOrder,
  listProductsWithStock
};
