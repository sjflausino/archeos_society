# Archeos Society - Documento de Requisitos 📋

Este documento detalha o escopo do produto **Archeos Society - Digital Edition**, descrevendo as funcionalidades e restrições implementadas no sistema de acordo com as regras originais do jogo de tabuleiro. O projeto foi desenhado para assegurar total aderência às mecânicas de expedições, limites de turnos e pontuação.

---

## ✅ Escopo do Produto (Requisitos)

### 🎮 1. Requisitos Funcionais (RF)

#### 1.1 Gerenciamento da Partida
* **RF01 – Criar partida:** O sistema deve permitir iniciar uma nova partida com 2 a 6 jogadores.
* **RF02 – Configurar papéis (roles):** O sistema deve permitir selecionar 6 papéis para compor o baralho da partida.
* **RF03 – Montar baralho automaticamente:** O sistema deve montar o baralho com base nos papéis selecionados.
* **RF04 – Configurar sítios arqueológicos:** O sistema deve configurar os 6 sítios com seus lados (básico ou avançado).
* **RF05 – Inicializar jogadores:** O sistema deve atribuir cor ao jogador, inicializar veículos nas trilhas e inicializar a pontuação em 0.
* **RF06 – Aplicar configurações específicas de papéis:** O sistema deve ativar componentes adicionais conforme os papéis escolhidos (ex: Botânico, Linguista, Professor).

#### 🔄 1.2 Gerenciamento de Temporadas
* **RF07 – Iniciar temporada:** O sistema deve distribuir 1 carta para cada jogador, criar o mercado com N+2 cartas e inserir cartas de macaco no baralho.
* **RF08 – Definir jogador inicial:** O sistema deve definir o jogador inicial conforme regras da temporada.
* **RF09 – Controlar número de temporadas:** O sistema deve encerrar o jogo após 2 temporadas (para 2–3 jogadores) ou 3 temporadas (para 4–6 jogadores).

#### 🔁 1.3 Gerenciamento de Turnos
* **RF10 – Controlar ordem de turno:** O sistema deve gerenciar turnos em ordem circular.
* **RF11 – Iniciar turno do jogador:** O sistema deve validar o estado do jogador ao iniciar o turno.
* **RF12 – Restringir ações por estado da mão:** O sistema deve impedir compra se o jogador tiver o limite máximo de cartas (10 cartas).

#### 🃏 1.4 Compra de Cartas
* **RF13 – Comprar carta do mercado:** O sistema deve permitir ao jogador pegar uma carta visível.
* **RF14 – Comprar carta do baralho:** O sistema deve permitir comprar do topo do baralho oculto.
* **RF15 – Comprar carta extra com mercado vazio:** O sistema deve conceder uma compra adicional se o mercado estiver vazio.
* **RF16 – Controlar limite de mão:** O sistema deve impedir rigorosamente que o jogador ultrapasse o limite de 10 cartas na mão.

#### 🐒 1.5 Cartas de Macaco
* **RF17 – Revelar carta de macaco automaticamente:** O sistema deve revelar cartas de macaco assim que forem compradas.
* **RF18 – Descartar carta de macaco:** O sistema deve remover a carta de macaco do jogo ou separá-la adequadamente da mão do jogador.
* **RF19 – Comprar nova carta após macaco:** O sistema deve forçar uma nova compra após a revelação de um macaco.
* **RF20 – Encerrar temporada no terceiro macaco:** O sistema deve finalizar a temporada imediatamente ao revelar o terceiro macaco.

#### 🧭 1.6 Expedições
* **RF21 – Permitir jogar expedição:** O sistema deve permitir jogar uma expedição composta por 1 ou mais cartas.
* **RF22 – Definir líder da expedição:** O sistema deve permitir escolher uma carta como líder da expedição.
* **RF23 – Validar expedição:** O sistema deve validar que todas as cartas da expedição compartilham a mesma cor **OU** a mesma função (papel).
* **RF24 – Permitir uso de cartas idênticas:** O sistema deve permitir a presença de cartas repetidas dentro de uma expedição válida.

#### ⚙️ 1.7 Resolução de Expedição
* **RF25 – Resolver efeito de cor:** O sistema deve verificar e aplicar o avanço nas trilhas dos sítios correspondentes, de acordo com o tamanho da expedição jogada.
* **RF26 – Limitar avanço por expedição:** O sistema deve permitir no máximo 1 avanço regular em trilha por expedição jogada.
* **RF27 – Resolver efeito de função:** O sistema deve executar o efeito específico do papel designado como líder.
* **RF28 – Aplicar efeitos específicos de papéis:** O sistema deve aplicar corretamente habilidades avançadas (como Guia, Médico, Fotógrafo, etc.).
* **RF29 – Manter expedições na mesa:** O sistema deve armazenar as expedições na área de jogo (mesa) até o fim da temporada.
* **RF30 – Descartar mão restante:** O sistema deve forçar o descarte (mover para o mercado aberto) de todas as cartas não utilizadas na mão após jogar uma expedição.

#### 📍 1.8 Trilhas e Movimentação
* **RF31 – Controlar progresso nas trilhas:** O sistema deve registrar e atualizar a posição dos veículos de cada jogador.
* **RF32 – Validar limites (threshold):** O sistema deve validar o tamanho mínimo da expedição necessário para avançar em uma determinada posição da trilha.
* **RF33 – Aplicar efeitos de sítios arqueológicos:** O sistema deve aplicar efeitos específicos de cada trilha (Lados A e B) durante o avanço.

#### 🧮 1.9 Fim de Temporada
* **RF34 – Encerrar temporada automaticamente:** O sistema deve finalizar a rodada após a aparição do terceiro macaco.
* **RF35 – Resetar cartas:** O sistema deve recolher todas as cartas (mesa, mercado e baralho) para recompor o deck na próxima temporada.
* **RF36 – Resolver efeitos de fim de temporada:** O sistema deve aplicar efeitos passivos de papéis ou locais que disparam no final da rodada.
* **RF37 – Calcular pontos de sítios:** O sistema deve pontuar cada jogador conforme a posição alcançada pelos seus veículos nas trilhas.
* **RF38 – Calcular pontos de expedições:** O sistema deve pontuar as expedições jogadas na temporada conforme seu tamanho:
    * 1 carta: 0 pontos
    * 2 cartas: 1 ponto
    * 3 cartas: 3 pontos
    * 4 cartas: 5 pontos
    * 5 cartas: 8 pontos
    * 6+ cartas: 12 pontos
* **RF39 – Aplicar modificadores de pontuação:** O sistema deve calcular efeitos finais, como bônus do Fotógrafo ou penalidades envolvendo Mercenários.

#### 🏁 1.10 Fim do Jogo
* **RF40 – Encerrar jogo após última temporada:** O sistema deve finalizar a partida e calcular a pontuação global após a 2ª ou 3ª temporada.
* **RF41 – Determinar vencedor:** O sistema deve identificar o jogador com a maior pontuação acumulada.
* **RF42 – Aplicar critérios de desempate:** O sistema deve comparar as maiores expedições jogadas na última temporada para resolver empates.

---

### ⚙️ 2. Requisitos Não Funcionais (RNF)

#### 🧠 2.1 Regras e Consistência
* **RNF01 – Consistência de regras:** O sistema deve garantir que todas as regras e exceções do jogo de tabuleiro sejam aplicadas corretamente.
* **RNF02 – Integridade do estado:** O sistema não deve permitir transições para estados inválidos (ex: expedição com requisitos de cor/função misturados).

#### ⚡ 2.2 Desempenho
* **RNF03 – Tempo de resposta:** As ações do jogador devem ser validadas e processadas pela API em até 1 segundo.

#### 💻 2.3 Usabilidade
* **RNF04 – Interface clara:** O sistema visual (Frontend) deve exibir claramente a mão do jogador, o mercado aberto, as trilhas de progressão e as expedições na mesa.
* **RNF05 – Feedback de ações:** O sistema deve informar claramente os jogadores sobre erros de regra e confirmar os efeitos ativados.

#### 🔄 2.4 Escalabilidade e Arquitetura
* **RNF06 – Arquitetura modular:** O código do backend deve permitir adicionar novos papéis ou regras de locais de forma facilitada.
* **RNF07 – Separação de lógica e interface:** A lógica do jogo (FastAPI) deve ser independente da interface visual (React).

#### 💾 2.5 Persistência
* **RNF08 – Persistência de partida:** O estado completo da partida deve ser serializado e persistido (SQLite/JSON), garantindo a recuperação da sessão.

#### 🔐 2.6 Confiabilidade
* **RNF09 – Controle de turno seguro:** O sistema deve validar estritamente o `current_turn_player_id`, rejeitando qualquer ação realizada fora do turno do jogador.