import { CardColor, CardFunction, GameCard, Player } from '../app/types'
import { BackendCard, BackendGameState, BackendPlayer } from './types'

const REGION_TO_COLOR: Record<string, CardColor> = {
  'América do Norte': 'red',
  'América do Sul': 'green',
  'Europa': 'blue',
  'África': 'yellow',
  'Ásia': 'purple',
  'Oceania': 'red',
  'Especial': 'red',
}

const ROLE_TO_FUNCTION: Record<string, CardFunction> = {
  'Botânico': 'research',
  'Linguista': 'research',
  'Professor': 'research',
  'Explorador': 'transport',
  'Guia': 'excavation',
  'Médico': 'funding',
  'Mercenário': 'artifact',
  'Cartógrafo': 'excavation',
  'Piloto': 'transport',
  'Patrono': 'funding',
  'Curador': 'artifact',
  'Fotógrafo': 'artifact',
  'Estudante': 'excavation',
  'Macaco': 'monkey',
}

const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316']

export function adaptCard(card: BackendCard, index: number): GameCard {
  return {
    id: `card-${index}-${card.role}-${card.color}`,
    color: REGION_TO_COLOR[card.color] ?? 'red',
    function: card.is_monkey ? 'monkey' : (ROLE_TO_FUNCTION[card.role] ?? 'excavation'),
    value: card.value,
    role: card.role,
    region: card.color,
  }
}

export function adaptPlayer(
  playerId: string,
  backendPlayer: BackendPlayer,
  displayColor: string,
): Player {
  return {
    id: playerId,
    name: playerId,
    color: displayColor,
    score: backendPlayer.score,
    cards: backendPlayer.hand.map((c, i) => adaptCard(c, i)),
    position: Math.max(0, ...Object.values(backendPlayer.tracks)),
    tracks: backendPlayer.tracks,
  }
}

export function adaptGameState(
  state: BackendGameState,
  playerColors: Record<string, string>,
) {
  const players = state.player_order.map((pid, i) => {
    const bp = state.players[pid]
    const color = playerColors[pid] ?? PLAYER_COLORS[i % PLAYER_COLORS.length]
    return adaptPlayer(pid, bp, color)
  })

  const market = state.market.map((c, i) => adaptCard(c, i))

  return {
    players,
    market,
    currentPlayerId: state.current_turn_player_id,
    season: state.season,
    monkeysFound: state.monkeys_found,
    status: state.status,
    availableActions: state.available_actions ?? [],
  }
}
