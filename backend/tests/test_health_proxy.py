"""Testes de /health e do tratamento de proxy reverso."""
from flask import Flask, request

import endpoints


def test_health_responde_ok_sem_autenticacao(client):
    resp = client.get("/health")

    assert resp.status_code == 200
    assert resp.get_json() == {"status": "ok"}


def test_health_nao_consome_rate_limit(client):
    # O limite padrão é 200/min: 250 chamadas só passam se /health estiver isento.
    codigos = {client.get("/health").status_code for _ in range(250)}

    assert codigos == {200}


def _cliente_com_proxyfix(habilitado):
    app = Flask(__name__)

    @app.route("/ip")
    def ip():
        return request.remote_addr

    endpoints.apply_proxy_fix(app, enabled=habilitado)
    return app.test_client()


def test_proxyfix_so_confia_em_x_forwarded_for_quando_habilitado():
    headers = {"X-Forwarded-For": "203.0.113.7"}

    com_proxy = _cliente_com_proxyfix(True).get("/ip", headers=headers).get_data(as_text=True)
    sem_proxy = _cliente_com_proxyfix(False).get("/ip", headers=headers).get_data(as_text=True)

    assert com_proxy == "203.0.113.7"
    assert sem_proxy != "203.0.113.7"  # sem proxy, o header forjado é ignorado
