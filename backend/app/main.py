from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_game import router as game_router
from app.api.routes_turn import router as turn_router
from app.db.database import engine, Base

# Inicializa as tabelas do banco de dados SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Archeos Society Engine",
    description="Backend API para gerenciamento do jogo de tabuleiro Archeos Society",
    version="1.0.0"
)

# --- CONFIGURAÇÃO DE CORS ---
# Essencial para permitir a comunicação entre domínios no Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite acesso de qualquer origem (ideal para o MVP)
    allow_credentials=True,
    allow_methods=["*"], # Libera OPTIONS, POST, GET, etc.
    allow_headers=["*"],
)

# Registro das rotas
app.include_router(game_router)
app.include_router(turn_router)

@app.get("/")
async def root():
    return {
        "status": "online", 
        "message": "Archeos Society API operante. Acesse /docs para visualizar o Swagger."
    }