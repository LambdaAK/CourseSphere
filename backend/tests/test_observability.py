"""Testes de observabilidade: logs JSON, request-id e /metrics."""
import json
import logging
import re

from firebase_admin import auth

import firebase
import observability


def test_metrics_expoe_contadores_e_histograma_prometheus(client):
    client.get("/health")

    resp = client.get("/metrics")
    corpo = resp.get_data(as_text=True)

    assert resp.status_code == 200
    assert resp.mimetype == "text/plain"
    assert "http_requests_total{" in corpo and 'endpoint="/health"' in corpo
    assert "http_request_duration_seconds_bucket" in corpo


def test_gera_request_id_e_devolve_no_header(client):
    resp = client.get("/health")

    assert re.fullmatch(r"[0-9a-f]{32}", resp.headers["X-Request-ID"])


def test_reaproveita_request_id_valido_e_descarta_invalido(client):
    valido = client.get("/health", headers={"X-Request-ID": "abc12345"})
    invalido = client.get("/health", headers={"X-Request-ID": "<script>alert(1)</script>"})

    assert valido.headers["X-Request-ID"] == "abc12345"
    assert invalido.headers["X-Request-ID"] != "<script>alert(1)</script>"


def test_log_de_acesso_e_json_sem_query_string_nem_token(client, caplog):
    caplog.set_level(logging.INFO)

    client.get("/users/info?id_token=SEGREDO123")

    registros = [r for r in caplog.records if getattr(r, "event", "") == "http_request"]
    linha = observability.JsonFormatter().format(registros[-1])
    dados = json.loads(linha)
    assert dados["status"] == 401
    assert dados["path"] == "/users/info"
    assert dados["request_id"] and dados["duration_ms"] >= 0
    assert "SEGREDO123" not in linha


def test_falha_de_autenticacao_gera_evento_auth_failed(client, caplog, monkeypatch):
    def invalido(token):
        raise auth.InvalidIdTokenError("detalhe interno")

    monkeypatch.setattr(auth, "verify_id_token", invalido)
    caplog.set_level(logging.INFO)

    client.get("/users/info", headers={"Authorization": "Bearer lixo"})

    assert any(getattr(r, "event", "") == "auth_failed" for r in caplog.records)


def test_criacao_de_usuario_gera_evento_sem_dados_pessoais(client, caplog, monkeypatch):
    monkeypatch.setattr(
        firebase.Firebase, "create_user", staticmethod(lambda email, password: {"user_id": "u1"})
    )
    caplog.set_level(logging.INFO)

    client.post("/users/create", json={"email": "pessoa@exemplo.com", "password": "123456"})

    eventos = [r for r in caplog.records if getattr(r, "event", "") == "user_created"]
    assert eventos
    assert "pessoa@exemplo.com" not in observability.JsonFormatter().format(eventos[0])


def test_erro_inesperado_e_logado_com_stack_trace_em_json(caplog):
    logger = logging.getLogger("coursesphere")
    try:
        raise RuntimeError("falha interna")
    except RuntimeError as exc:
        logger.error("create_user failed", exc_info=exc)

    dados = json.loads(observability.JsonFormatter().format(caplog.records[-1]))
    assert dados["level"] == "ERROR"
    assert "RuntimeError: falha interna" in dados["exc_info"]
