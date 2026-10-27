"""Testes de regressão do hardening (headers de segurança e rate limiting)."""
import firebase


def test_resposta_tem_headers_de_seguranca(client):
    resp = client.get("/users/info")  # 401: o header deve existir até em erros

    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert resp.headers.get("Referrer-Policy") == "no-referrer"
    assert "frame-ancestors 'none'" in resp.headers.get("Content-Security-Policy", "")
    assert resp.headers.get("Cache-Control") == "no-store"


def test_hsts_so_e_enviado_quando_a_conexao_e_https(client):
    http = client.get("/users/info")
    https = client.get("/users/info", headers={"X-Forwarded-Proto": "https"})

    assert "Strict-Transport-Security" not in http.headers
    assert "max-age=" in https.headers.get("Strict-Transport-Security", "")


def _criar_usuarios(client, monkeypatch, quantidade):
    monkeypatch.setattr(
        firebase.Firebase, "create_user", staticmethod(lambda email, password: {"user_id": "u1"})
    )
    return [
        client.post("/users/create", json={"email": f"a{i}@b.com", "password": "123456"})
        for i in range(quantidade)
    ]


def test_rate_limit_bloqueia_criacao_de_contas_em_massa(client, monkeypatch):
    respostas = _criar_usuarios(client, monkeypatch, 7)

    assert [r.status_code for r in respostas[:5]] == [200] * 5
    assert 429 in [r.status_code for r in respostas[5:]]


def test_resposta_429_e_json_sem_detalhes_internos(client, monkeypatch):
    respostas = _criar_usuarios(client, monkeypatch, 7)
    bloqueada = [r for r in respostas if r.status_code == 429][0]

    assert bloqueada.get_json() == {"error": "Too many requests"}
