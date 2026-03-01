// Internal adapter stub for the external Payment API.
// The external service itself is intentionally not implemented in this repo.
let paymentSequence = 1;

function charge({ paymentMethod }) {
  if (paymentMethod === "DECLINED_CARD") {
    return {
      approved: false,
      code: "CARD_DECLINED"
    };
  }

  if (paymentMethod === "GATEWAY_TIMEOUT") {
    const error = new Error("Payment gateway timeout");
    error.code = "GATEWAY_TIMEOUT";
    throw error;
  }

  const paymentId = `PAY-${String(paymentSequence).padStart(3, "0")}`;
  paymentSequence += 1;

  return {
    approved: true,
    paymentId
  };
}

module.exports = {
  charge
};
