"""Observabilidade: logs estruturados (JSON), request-id e métricas Prometheus."""
import json
import logging
import os
import re
import sys
import time
import uuid
from datetime import datetime, timezone

from flask import Response, g, request
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

# Aceita só ids "seguros" vindos do proxy; qualquer outra coisa é descartada (evita log injection).
REQUEST_ID_RE = re.compile(r"^[0-9a-fA-F-]{8,64}$")

HTTP_REQUESTS = Counter(
    "http_requests_total",
    "Total de requisições HTTP",
    ["method", "endpoint", "status"],
)
HTTP_LATENCY = Histogram(
    "http_request_duration_seconds",
    "Latência das requisições HTTP, em segundos",
    ["endpoint"],
    buckets=(0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5),
)

# Atributos padrão de um LogRecord: o que sobrar em record.__dict__ veio de `extra=`.
_STANDARD_ATTRS = set(logging.LogRecord("", 0, "", 0, "", (), None).__dict__) | {"message", "asctime"}


class JsonFormatter(logging.Formatter):
    """Uma linha JSON por evento, fácil de buscar e agregar (ELK, Loki, CloudWatch)."""

    def format(self, record):
        data = {
            "ts": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key, value in record.__dict__.items():
            if key not in _STANDARD_ATTRS and not key.startswith("_"):
                data[key] = value
        if record.exc_info:
            data["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(data, ensure_ascii=False, default=str)


def configure_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(os.environ.get("LOG_LEVEL", "INFO").upper())


def init_observability(app, limiter):
    access_log = logging.getLogger("coursesphere.access")

    @app.before_request
    def _start_request():
        g.start = time.perf_counter()
        incoming = request.headers.get("X-Request-ID", "")
        g.request_id = incoming if REQUEST_ID_RE.match(incoming) else uuid.uuid4().hex

    @app.after_request
    def _finish_request(response):
        duration = time.perf_counter() - g.get("start", time.perf_counter())
        # O rótulo usa o padrão da rota (/chats/<chat_id>), não a URL real: evita explosão de séries.
        endpoint = request.url_rule.rule if request.url_rule else "unmatched"
        HTTP_REQUESTS.labels(request.method, endpoint, str(response.status_code)).inc()
        HTTP_LATENCY.labels(endpoint).observe(duration)
        request_id = g.get("request_id", "")
        response.headers["X-Request-ID"] = request_id
        # Só o path é registrado, nunca a query string (que poderia carregar segredos).
        access_log.info(
            "request",
            extra={
                "event": "http_request",
                "request_id": request_id,
                "method": request.method,
                "path": request.path,
                "endpoint": endpoint,
                "status": response.status_code,
                "duration_ms": round(duration * 1000, 2),
                "remote_addr": request.remote_addr,
            },
        )
        return response

    @app.route("/metrics", methods=["GET"])
    @limiter.exempt
    def metrics():
        """Métricas no formato Prometheus. O Nginx NÃO expõe esta rota ao público."""
        return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)
