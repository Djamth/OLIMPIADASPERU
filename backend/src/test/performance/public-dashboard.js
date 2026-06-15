import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

const baseUrl = __ENV.BASE_URL || "http://localhost:8080/olimpiadas";

export default function () {
  const response = http.get(`${baseUrl}/api/public/resumen`);

  check(response, {
    "respuesta HTTP 200": (result) => result.status === 200,
    "incluye metricas": (result) => Boolean(result.json("metricas")),
  });

  sleep(1);
}
