FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Usuário sem privilégios: se o app for comprometido, o atacante não é root.
RUN groupadd --system app && useradd --system --gid app --no-create-home app

WORKDIR /app

# Dependências primeiro: o cache de camadas só é refeito se requirements.txt mudar.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY --chown=app:app . .
USER app

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request, sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:5000/health', timeout=2).status == 200 else 1)"

# 1 worker + 4 threads por instância: o rate limit em memória fica coerente por instância.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "4", "--timeout", "30", "--access-logfile", "-", "endpoints:app"]
