import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { GameCard } from '../components/GameCard';
import { PlayerInfo } from '../components/PlayerInfo';
import { Player, GameCard as GameCardType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart, Package, Send, AlertCircle, Menu, X,
  Eye, ChevronDown, ChevronUp, Hand, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { useGameStore } from '../../store/gameStore';
import { gameApi } from '../../api/game';
import { adaptGameState } from '../../api/adapters';
import { BackendGameState } from '../../api/types';

const POLL_INTERVAL = 3000

export default function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId: storedGameId, myPlayerId, playerColors } = useGameStore();

  const gid = storedGameId ?? location.state?.gameCode ?? null

  const [players, setPlayers] = useState<Player[]>([])
  const [market, setMarket] = useState<GameCardType[]>([])
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null)
  const [season, setSeason] = useState(1)
  const [monkeysFound, setMonkeysFound] = useState(0)
  const [status, setStatus] = useState<string>('PLAYING')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [myHandOpen, setMyHandOpen] = useState(false)
  const [availableActions, setAvailableActions] = useState<string[]>([])

  const statusRef = useRef(status)
  statusRef.current = status
  const monkeysFoundRef = useRef(0)

  useEffect(() => {
    if (!gid) { navigate('/'); return }

    const fetchState = async () => {
      try {
        const res = await gameApi.getState(gid)
        const raw: BackendGameState = res.data
        const adapted = adaptGameState(raw, playerColors)
        setPlayers(adapted.players)
        setMarket(adapted.market)
        setCurrentPlayerId(adapted.currentPlayerId)
        setSeason(adapted.season)
        setStatus(adapted.status)
        setAvailableActions(adapted.availableActions)
        setLoading(false)

        // RNF05 – notifica todos os jogadores quando um macaco é revelado via poll
        if (adapted.monkeysFound > monkeysFoundRef.current) {
          const count = adapted.monkeysFound
          if (count >= 3) {
            toast.error(`🐒 3º macaco revelado! A temporada acabou.`)
          } else {
            toast.error(`🐒 Macaco revelado! (${count}/3)`)
          }
        }
        monkeysFoundRef.current = adapted.monkeysFound
        setMonkeysFound(adapted.monkeysFound)

        if (adapted.status === 'SEASON_ENDED' && statusRef.current !== 'SEASON_ENDED') {
          navigate('/season-end', { state: { gameId: gid } })
        } else if (adapted.status === 'FINISHED' && statusRef.current !== 'FINISHED') {
          navigate('/game-end', { state: { gameId: gid } })
        }
      } catch {
        // silently retry on network errors
      }
    }

    fetchState()
    const interval = setInterval(fetchState, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [gid, navigate, playerColors])

  // Navigate on status change
  useEffect(() => {
    if (status === 'SEASON_ENDED') navigate('/season-end', { state: { gameId: gid } })
    else if (status === 'FINISHED') navigate('/game-end', { state: { gameId: gid } })
  }, [status, gid, navigate])

  if (!gid) return null

  const myPlayer = myPlayerId ? players.find((p) => p.id === myPlayerId) ?? null : null
  const currentPlayer = players.find((p) => p.id === currentPlayerId) ?? players[0] ?? null
  const isMyTurn = !!myPlayerId && myPlayerId === currentPlayerId

  const MAX_HAND_SIZE = 10
  const myCards = myPlayer?.cards ?? []
  const selectedCards = selectedIndices.map((i) => myCards[i]).filter(Boolean)

  const toggleCardSelection = (index: number) => {
    const card = myCards[index]
    if (!card) return
    if (card.function === 'monkey') { toast.error('Cartas de macaco não podem ser usadas em expedições!'); return }
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const canDrawMarket = isMyTurn && availableActions.includes('draw_market')
  const canDrawDeck = isMyTurn && availableActions.includes('draw_deck')
  const canPlayExpedition = isMyTurn && availableActions.includes('play_expedition')

  const buyFromMarket = async (marketIndex: number) => {
    if (!canDrawMarket || !myPlayerId || !gid) return
    if ((myPlayer?.cards.length ?? 0) >= MAX_HAND_SIZE) { toast.error('Limite de cartas atingido! (máx: 10)'); return }
    setActionLoading(true)
    try {
      const res = await gameApi.drawFromMarket(gid, myPlayerId, marketIndex)
      if (res.data?.monkey_revealed) {
        toast.error(res.data.message, { icon: '🐒' })
      } else {
        toast.success('Carta comprada do mercado!')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erro ao comprar do mercado')
    } finally {
      setActionLoading(false)
    }
  }

  const buyFromDeck = async () => {
    if (!canDrawDeck || !myPlayerId || !gid) return
    if ((myPlayer?.cards.length ?? 0) >= MAX_HAND_SIZE) { toast.error('Limite de cartas atingido! (máx: 10)'); return }
    setActionLoading(true)
    try {
      const res = await gameApi.drawFromDeck(gid, myPlayerId)
      if (res.data?.monkey_revealed) {
        toast.error(res.data.message, { icon: '🐒' })
      } else {
        toast.success('Carta comprada do baralho!')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erro ao comprar do baralho')
    } finally {
      setActionLoading(false)
    }
  }

  const startExpedition = () => {
    if (selectedIndices.length < 2) { toast.error('Selecione ao menos 2 cartas!'); return }
    navigate('/expedition', {
      state: { gameId: gid, playerId: myPlayerId, selectedIndices, selectedCards },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Archeos Society</h1>
            <p className="text-sm text-slate-400">Temporada {season} • Macacos: {monkeysFound}/3</p>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
          {currentPlayer && (
            <div className="hidden md:block text-right">
              <div className="text-sm text-slate-400">Vez de</div>
              <div className="text-lg font-bold" style={{ color: currentPlayer.color }}>{currentPlayer.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Watching banner */}
      {!isMyTurn && myPlayerId && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2"
        >
          <Eye className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            Você está observando — é a vez de{' '}
            <span className="font-bold" style={{ color: currentPlayer?.color }}>{currentPlayer?.name}</span>.
          </p>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <AnimatePresence>
          {(mobileMenuOpen || true) && (
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="hidden md:block w-80 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700 p-4 overflow-y-auto"
            >
              <h2 className="text-lg font-bold text-white mb-4">Jogadores</h2>
              <div className="space-y-3">
                {players.map((player) => (
                  <PlayerInfo key={player.id} player={player} isActive={player.id === currentPlayerId} />
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Trilhas</h3>
                {players.map((player) => (
                  <div key={player.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                      <span className="text-sm text-white">{player.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className={`w-full h-2 rounded ${i < player.position ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-3">Macacos Revelados</h3>
                <div className={`p-4 rounded-lg ${monkeysFound >= 3 ? 'bg-red-500/30 border-2 border-red-500' : 'bg-orange-500/20 border border-orange-500'}`}>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {['🙈', '🙉', '🙊'].map((emoji, i) => (
                      <div key={i} className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${i < monkeysFound ? 'bg-orange-600' : 'bg-slate-700'}`}>
                        {i < monkeysFound ? emoji : '?'}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm font-bold text-orange-300">{monkeysFound}/3 Macacos</p>
                  {monkeysFound >= 2 && monkeysFound < 3 && (
                    <p className="text-center text-xs text-orange-200 mt-1">⚠️ Próximo macaco encerra a temporada!</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* Market */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                Mercado
              </h2>
              <Button
                onClick={buyFromDeck}
                disabled={!canDrawDeck || actionLoading}
                variant="outline"
                className="bg-purple-500/20 border-purple-500 hover:bg-purple-500/30 disabled:opacity-40"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
                Comprar do Baralho
              </Button>
            </div>
            <div className={`flex gap-3 overflow-x-auto pb-4 ${!isMyTurn ? 'opacity-80' : ''}`}>
              {market.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={canDrawMarket && !actionLoading ? () => buyFromMarket(idx) : undefined}
                  className={canDrawMarket && !actionLoading ? 'cursor-pointer' : 'cursor-default'}
                >
                  <GameCard card={card} />
                </div>
              ))}
            </div>
          </div>

          {/* Hand area */}
          {canPlayExpedition || isMyTurn ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Sua Mão
                  <span className={`ml-2 text-sm ${myCards.length >= MAX_HAND_SIZE ? 'text-red-400' : 'text-slate-400'}`}>
                    ({myCards.length}/{MAX_HAND_SIZE})
                  </span>
                </h2>
                <Button
                  onClick={startExpedition}
                  disabled={selectedIndices.length < 2 || !canPlayExpedition}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Expedição ({selectedIndices.length})
                </Button>
              </div>

              {myCards.length >= MAX_HAND_SIZE && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300 text-sm">Limite atingido! Faça uma expedição antes de comprar mais.</p>
                </div>
              )}

              <div className="flex gap-3 overflow-x-auto pb-4">
                {myCards.map((card, idx) => (
                  <div key={card.id} onClick={() => toggleCardSelection(idx)} className="cursor-pointer">
                    <GameCard card={card} selected={selectedIndices.includes(idx)} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <Hand className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <p className="text-slate-400 text-sm">
                  <span className="font-semibold" style={{ color: currentPlayer?.color }}>{currentPlayer?.name}</span>
                  {' '}tem <span className="text-white font-bold">{currentPlayer?.cards.length ?? 0}</span> carta(s) na mão.
                </p>
              </div>
            </div>
          )}

          {/* My hand collapsible when watching */}
          {!isMyTurn && myPlayer && myPlayer.id !== currentPlayerId && (
            <div className="border border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setMyHandOpen((o) => !o)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/60 hover:bg-slate-800 transition-colors text-left"
              >
                <span className="text-white font-semibold">
                  Minha Mão
                  <span className="ml-2 text-slate-400 text-sm font-normal">({myCards.length}/{MAX_HAND_SIZE})</span>
                </span>
                {myHandOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {myHandOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-3 overflow-x-auto p-4 bg-slate-900/40">
                      {myCards.length === 0
                        ? <p className="text-slate-500 text-sm">Sua mão está vazia.</p>
                        : myCards.map((card) => (
                          <div key={card.id} className="cursor-default">
                            <GameCard card={card} />
                          </div>
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
