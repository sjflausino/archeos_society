from fastapi.testclient import TestClient
from app.main import app
from app.models.domain import Card, Expedition
from app.db.database import SessionLocal

from app.db.repository import load_game_state, save_game_state

client = TestClient(app)

def test_endpoint_draw_market_sucesso():
    res_create = client.post("/game/create", json={"player_ids": ["p1", "p2"]})
    game_id = res_create.json()["game_id"]
    
    db = SessionLocal()
    session = load_game_state(db, game_id)
    
    session.current_turn_player_id = "p1"
    player = session.players["p1"]
    player.hand.clear() 
    
    mercado_inicial = len(session.market)
    
    save_game_state(db, session)
    db.close()
    
    payload = {"player_id": "p1", "market_index": 0}
    response = client.post(f"/game/{game_id}/draw/market", json=payload)
    
    assert response.status_code == 200
    dados = response.json()
    assert dados["message"] == "Carta comprada do mercado com sucesso."
    assert dados["next_turn"] == "p2"

def test_endpoint_draw_deck_sucesso():
    res_create = client.post("/game/create", json={"player_ids": ["p1", "p2"]})
    game_id = res_create.json()["game_id"]
    
    db = SessionLocal()
    session = load_game_state(db, game_id)
    
    session.current_turn_player_id = "p1"
    player = session.players["p1"]
    player.hand.clear()
    
    session.deck.insert(0, Card(role="Guia", color="Europa"))
    
    save_game_state(db, session)
    db.close()
    
    payload = {"player_id": "p1"}
    response = client.post(f"/game/{game_id}/draw/deck", json=payload)
    
    assert response.status_code == 200
    assert response.json()["message"] == "Carta comprada do baralho oculto com sucesso."

def test_endpoint_draw_deck_revela_terceiro_macaco():
    res_create = client.post("/game/create", json={"player_ids": ["p1", "p2"]})
    game_id = res_create.json()["game_id"]
    
    db = SessionLocal()
    session = load_game_state(db, game_id)
    session.current_turn_player_id = "p1"
    session.monkeys_found = 2
    session.deck.insert(0, Card(role="Macaco", color="Especial", is_monkey=True))
    
    save_game_state(db, session)
    db.close()
    
    payload = {"player_id": "p1"}
    response = client.post(f"/game/{game_id}/draw/deck", json=payload)
    
    assert response.status_code == 200
    dados = response.json()
    
    # CORREÇÃO: Usando 'in' para não quebrar o teste por causa de espaços ou \n
    assert "O 3º macaco foi revelado!" in dados["message"]
    assert "A temporada acabou" in dados["message"]
    
    assert dados["game_status"] == "SEASON_ENDED"

def test_endpoint_draw_limite_de_mao_excedido():
    res_create = client.post("/game/create", json={"player_ids": ["p1", "p2"]})
    game_id = res_create.json()["game_id"]
    
    db = SessionLocal()
    session = load_game_state(db, game_id)
    session.current_turn_player_id = "p1"
    session.players["p1"].hand = [Card(role="Guia", color="Europa")] * 10
    
    save_game_state(db, session)
    db.close()
    
    payload_market = {"player_id": "p1", "market_index": 0}
    response_market = client.post(f"/game/{game_id}/draw/market", json=payload_market)
    
    payload_deck = {"player_id": "p1"}
    response_deck = client.post(f"/game/{game_id}/draw/deck", json=payload_deck)
    
    assert response_market.status_code == 400
    assert response_deck.status_code == 400

def test_endpoint_ready_inicia_nova_temporada():
    # Arrange: Cria um jogo e força o estado de fim de temporada
    res_create = client.post("/game/create", json={"player_ids": ["p1", "p2"]})
    game_id = res_create.json()["game_id"]
    
    db = SessionLocal()
    session = load_game_state(db, game_id)
    session.status = "SEASON_ENDED"
    save_game_state(db, session)
    db.close()

    # Act: Chama a nova rota de "Ready"
    response = client.post(f"/game/{game_id}/ready")
    
    # Assert
    assert response.status_code == 200
    assert response.json()["status"] == "PLAYING"    

def test_endpoint_get_game_inclui_max_expedition():
    # Arrange: Setup de jogo com uma expedição de 3 cartas para Alice
    res_create = client.post("/game/create", json={"player_ids": ["Alice", "Bob"]})
    game_id = res_create.json()["game_id"]
    
    db = SessionLocal()
    session = load_game_state(db, game_id)
    # Alice joga uma expedição de tamanho 3
    exp = Expedition(
        cards=[Card(role="Guia", color="Europa")] * 3,
        leader=Card(role="Guia", color="Europa"),
        color_matched=True
    )
    session.players["Alice"].expeditions_played.append(exp)
    save_game_state(db, session)
    db.close()

    # Act
    response = client.get(f"/game/{game_id}")
    dados = response.json()
    
    # Assert
    assert dados["players"]["Alice"]["max_expedition"] == 3
    assert dados["players"]["Bob"]["max_expedition"] == 0

def test_endpoint_summary_retorna_ranking_ordenado():
    # Arrange: Alice e Bob empatados em pontos, mas Bob com maior expedição
    res_create = client.post("/game/create", json={"player_ids": ["Alice", "Bob"]})
    game_id = res_create.json()["game_id"]
    
    db = SessionLocal()
    session = load_game_state(db, game_id)
    # Ambos com 10 pontos
    session.players["Alice"].score = 10
    session.players["Bob"].score = 10
    # Bob tem a maior expedição (critério de desempate RF42)
    session.players["Bob"].expeditions_played.append(
        Expedition(cards=[Card(role="Guia", color="Europa")]*5, leader=Card(role="Guia", color="Europa"), color_matched=True)
    )
    save_game_state(db, session)
    db.close()

    # Act
    response = client.get(f"/game/{game_id}/summary")
    ranking = response.json()["ranking"]
    
    # Assert: Bob deve vir em primeiro pelo desempate
    assert ranking[0]["player_id"] == "Bob" 
    assert ranking[1]["player_id"] == "Alice" 