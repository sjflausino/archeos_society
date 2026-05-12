# Archeos Society - Digital Edition 🏛️🃏

Este projeto é uma implementação digital do jogo de tabuleiro **Archeos Society**, de Paolo Mori, desenvolvido como parte de um projeto acadêmico de Sistemas de Informação na **Universidade Federal Fluminense (UFF)**.

O sistema permite que 2 a 6 jogadores compitam em expedições arqueológicas, gerenciando especialistas e recursos para acumular o maior prestígio ao longo de múltiplas temporadas.

## 🚀 Stack Tecnológica

* **Frontend:** [React + Vite](https://vitejs.dev/) (TypeScript, Tailwind CSS v4)
* **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11, Pydantic)
* **Persistência:** SQLAlchemy e SQLite (estado completo do jogo serializado em JSON)
* **Infraestrutura:** Docker & Docker Compose (Multi-stage builds)
* **Comunicação:** API RESTful modular (rotas dedicadas para macro-gestão de partidas e micro-gestão de turnos)

## 🛠️ Arquitetura e Decisões de Projeto

O projeto segue uma arquitetura dividida para garantir a separação clara de preocupações (**RNF07**):

1. **Core Engine (Backend):** Responsável por validar rigorosamente todas as regras do manual, como o limite de 10 cartas na mão, bloqueio de segurança contra ações fora de turno e o gatilho automático da 3ª carta de macaco.
2. **Interface (Frontend):** Desenvolvida em React e Vite para alta performance e modularidade estrutural. A tipagem do TypeScript espelha os contratos da API para evitar inconsistências de estado durante a partida.

## 📋 Regras Implementadas (MVP)

* [x] **Gestão de Mão:** Limite estrito de 10 cartas por jogador.
* [x] **Mecânica de Macacos:** Revelação da 3ª carta encerra a temporada imediatamente, limpando o mercado e a mesa.
* [x] **Expedições:** Lógica complexa de líderes, correspondência de cor/função e habilidades de especialistas (Guia, Botânico, Médico, Professor, etc.).
* [x] **Sítios Arqueológicos:** Progressão de veículos e pontuação diferenciada ajustável (Lado A básico e Lado B avançado).

## 💻 Como Executar 

Caso prefira rodar a aplicação nativamente, você precisará iniciar os serviços em dois terminais separados a partir da raiz do projeto clonado.

### 1. Subindo o Backend (FastAPI)
Abra um terminal, acesse a pasta do backend e inicie o ambiente virtual:

```bash
# Entre na pasta do backend (substitua 'backend' pelo nome exato da pasta se for diferente)
cd backend 

# Crie e ative um ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instale as dependências
pip install .

# Inicie o servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

```

A API estará disponível em `http://localhost:8000` e o Swagger em `http://localhost:8000/docs`.

### 2. Subindo o Frontend (React + Vite)

Em um novo terminal, a partir da raiz do repositório, acesse a pasta do frontend (onde se encontram os arquivos `package.json` e `vite.config.ts` listados):

```bash
# Entre na pasta do frontend (se for a raiz ou uma pasta específica como 'frontend')
cd frontend # Ajuste se o frontend não estiver numa subpasta

# Instale as dependências
npm install

# Configure as variáveis de ambiente apontando para a API local
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev

```

O frontend estará disponível no seu navegador em `http://localhost:5173`.

## 👥 Equipe de Desenvolvimento

Projeto construído colaborativamente por: Sandro Luis Flausino Junior, Yuri Moura, Caio Brasil, José Augusto, Alysson Rocha, Rafael Fernandes.

