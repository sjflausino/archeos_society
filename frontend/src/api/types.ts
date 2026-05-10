export interface BackendCard {
  role: string
  color: string
  is_monkey: boolean
  value: number
}

export interface BackendExpedition {
  cards: BackendCard[]
  leader: BackendCard
  color_matched: boolean
}

export interface BackendPlayer {
  id: string
  color_assigned: string | null
  score: number
  hand: BackendCard[]
  expeditions_played: BackendExpedition[]
  tracks: Record<string, number>
  linguist_track: number
  relics: number
  professor_tokens: number[]
  extra_vehicles: Record<string, number>
  max_expedition?: number
}

export interface BackendGameState {
  game_id: string
  status: 'WAITING_PLAYERS' | 'PLAYING' | 'SEASON_ENDED' | 'FINISHED'
  available_actions: string[]
  players: Record<string, BackendPlayer>
  player_order: string[]
  current_turn_index: number
  current_turn_player_id: string | null
  deck: BackendCard[]
  market: BackendCard[]
  monkeys_found: number
  season: number
  max_seasons: number
  site_configurations: Record<string, 'A' | 'B'>
}

export interface BackendRankingEntry {
  player_id: string
  total_score: number
  max_expedition: number
  tracks: Record<string, number>
}
