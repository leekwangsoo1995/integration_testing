const http = require("http");
const { URL } = require("url");
const orderService = require("./services/orderService");

const port = process.env.PORT || 3000;

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(body, null, 2));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk;
    });

    req.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        const parseError = new Error("Invalid JSON");
        parseError.statusCode = 400;
        parseError.code = "INVALID_JSON";
        reject(parseError);
      }
    });

    req.on("error", reject);
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    if (req.method === "GET" && pathname === "/health") {
      sendJson(res, 200, { status: "ok" });
      return;
    }

    if (req.method === "GET" && pathname === "/api/products") {
      sendJson(res, 200, {
        items: orderService.listProductsWithStock()
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/orders") {
      const payload = await readJson(req);
      const order = orderService.createOrder(payload);
      sendJson(res, 201, order);
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/orders/")) {
      const parts = pathname.split("/");

      if (parts.length === 4 && parts[3]) {
        const order = orderService.getOrder(parts[3]);
        sendJson(res, 200, order);
        return;
      }
    }

    sendJson(res, 404, {
      code: "NOT_FOUND",
      message: "Route not found."
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    sendJson(res, statusCode, {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "Unexpected error."
    });
  }
}

const server = http.createServer((req, res) => {
  handleRequest(req, res);
});

server.listen(port, () => {
  console.log(`Demo app listening on http://localhost:${port}`);
});
