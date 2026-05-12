from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Optional 
from sqlalchemy.orm import Session

from app.core.game_engine import (
    create_game, 
    play_expedition, 
    validate_player_turn,
    resolve_expedition_turn_end
)
from app.models.domain import Card, SiteSide
from app.db.database import get_db
from app.db.repository import save_game_state, load_game_state

router = APIRouter(prefix="/game", tags=["Game Management"])

# --- SCHEMAS DE ENTRADA ---
class CreateGameRequest(BaseModel):
    player_ids: List[str] = Field(..., min_length=2, max_length=6)
    selected_roles: Optional[List[str]] = None
    site_configs: Optional[Dict[str, SiteSide]] = Field(
        None, 
        description="Mapeamento das trilhas para o Lado A (BASIC) ou Lado B (ADVANCED)"
    )

class PlayExpeditionRequest(BaseModel):
    player_id: str
    card_indices: List[int] = Field(..., description="Índices das cartas na mão do jogador")
    leader_index: int = Field(..., description="Índice do líder na lista de cartas enviadas")
    target_track: Optional[str] = None
    choose_to_score: bool = False
    move_extra_vehicle: bool = False
    is_final_ur_round: bool = False


# --- ROTAS ---
@router.post("/create")
async def api_create_game(request: CreateGameRequest, db: Session = Depends(get_db)):
    try:
        session = create_game(
            player_ids=request.player_ids, 
            selected_roles=request.selected_roles,
            site_configs=request.site_configs # Passando a configuração do Lado A/B
        )
        # Salva o estado recém-criado no banco
        save_game_state(db, session)
        
        return {"message": "Partida criada com sucesso", "game_id": session.game_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{game_id}/play-expedition")
async def api_play_expedition(
    game_id: str, 
    request: PlayExpeditionRequest, 
    db: Session = Depends(get_db)
):
    # Carrega do banco
    session = load_game_state(db, game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Partida não encontrada")
    
    try:
        validate_player_turn(session, request.player_id)
        player = session.players.get(request.player_id)
        
        # Converte os índices enviados pelo frontend nas cartas reais da mão do jogador
        try:
            selected_cards = [player.hand[i] for i in request.card_indices]
        except IndexError:
            raise ValueError("Um ou mais índices de cartas são inválidos ou não existem na mão.")

        expedition = play_expedition(
            session=session, 
            player_id=request.player_id, 
            cards=selected_cards, 
            leader_index=request.leader_index, 
            target_track=request.target_track,
            choose_to_score=request.choose_to_score,
            move_extra_vehicle=request.move_extra_vehicle,
            is_final_ur_round=request.is_final_ur_round
        )
        
        # Passa o turno ou concede turno extra (Cartógrafo)
        resolve_expedition_turn_end(session, player, expedition)
        
        # Atualiza o banco com as consequências da jogada
        save_game_state(db, session)
        
        return {
            "message": "Expedição jogada com sucesso", 
            "expedition_size": len(expedition.cards),
            "next_turn": session.current_turn_player_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{game_id}/ready")
async def api_next_season(game_id: str, db: Session = Depends(get_db)):
    session = load_game_state(db, game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Partida não encontrada")
        
    if session.status != "SEASON_ENDED":
        raise HTTPException(status_code=400, detail="O jogo não está em pausa de temporada.")
    
    # Retorna ao estado de jogo ativo
    session.status = "PLAYING"
    save_game_state(db, session)
    return {"message": "Nova temporada iniciada!", "status": session.status} 


@router.get("/{game_id}")
async def get_game_state(game_id: str, db: Session = Depends(get_db)):
    session = load_game_state(db, game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Partida não encontrada")
    
    state_dict = session.model_dump()

    for pid, player in session.players.items():
        max_val = max([len(e.cards) for e in player.expeditions_played], default=0)
        state_dict["players"][pid]["max_expedition"] = max_val

    # RF11 – ações disponíveis para o jogador do turno atual
    current_player = session.players.get(session.current_turn_player_id)
    available_actions = []
    if current_player and session.status == "PLAYING":
        if len(current_player.hand) < 10:
            if session.deck:
                available_actions.append("draw_deck")
            if session.market:
                available_actions.append("draw_market")
        if len(current_player.hand) >= 1:
            available_actions.append("play_expedition")
    state_dict["available_actions"] = available_actions

    return state_dict

@router.get("/{game_id}/summary")
async def get_game_summary(game_id: str, db: Session = Depends(get_db)):
    from app.core.game_engine import determine_winner
    session = load_game_state(db, game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Partida não encontrada")
    
    # Retorna o ranking ordenado pelos critérios de pontuação e desempate
    ranking = determine_winner(session)
    return {"ranking": ranking}