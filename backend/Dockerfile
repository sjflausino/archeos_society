# Estágio 1: Build e Instalação de dependências
FROM python:3.11-slim as builder

WORKDIR /app

# Copia o arquivo de definição do projeto
# O Docker precisa deste arquivo para saber o que instalar
COPY pyproject.toml .

# Instala as dependências de produção definidas no [project]
# O ponto "." indica o diretório atual onde está o pyproject.toml
RUN pip install --user --no-cache-dir .

# Estágio 2: Imagem Final de Execução
FROM python:3.11-slim

WORKDIR /app

# Copia apenas os pacotes instalados (limpeza de imagem)
COPY --from=builder /root/.local /root/.local

# Copia o código da sua aplicação
COPY ./app ./app

# Configurações para garantir que o Python encontre os pacotes e rode sem travar logs
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

EXPOSE 8000

# Comando para rodar o FastAPI com suporte a WebSockets
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]