"""Configuração dos testes de segurança.

Os testes não precisam do emulador do Firebase nem de credenciais: o Admin SDK
é inicializado em modo emulador (sem rede) e as chamadas externas são
substituídas por monkeypatch em cada teste.
"""
import os
import sys

os.environ.setdefault("FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9099")
os.environ.setdefault("FIREBASE_DATABASE_EMULATOR_HOST", "127.0.0.1:9000")
os.environ.setdefault("GCLOUD_PROJECT", "demo-coursesphere")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402

import endpoints  # noqa: E402


@pytest.fixture()
def client():
    endpoints.app.config["TESTING"] = True
    limiter = getattr(endpoints, "limiter", None)
    if limiter is not None:
        limiter.reset()  # cada teste começa com os contadores zerados
    return endpoints.app.test_client()
