# Archeos Society - Frontend Interface 🧭

Esta é a interface de utilizador (UI) do **Archeos Society**, desenvolvida para oferecer uma experiência de jogo fluida, responsiva e altamente tipada. O projeto utiliza as ferramentas mais modernas do ecossistema React para garantir performance e facilidade de manutenção.

## 🛠️ Stack Tecnológica

* **React 18**: Biblioteca base para a construção dos componentes e gestão do estado da interface.
* **Vite**: Ferramenta de build de última geração que proporciona um ambiente de desenvolvimento instantâneo.
* **TypeScript**: Implementação de tipagem estática em todo o projeto, garantindo que os contratos com o backend sejam respeitados.
* **Tailwind CSS (v4)**: Estilização moderna com suporte nativo a variáveis CSS dinâmicas e o novo espaço de cor **OKLCH**.
* **PostCSS & CSS Modules**: Para uma gestão de estilos granular e organizada.

## 🏗️ Organização do Código

O diretório `/src` está estruturado para separar as preocupações de comunicação, lógica de domínio e apresentação:

### 1. Camada de API (`/src/api`)

Contém as interfaces que espelham exatamente o estado do servidor.

* **`types.ts`**: Define estruturas críticas como `BackendGameState`, que monitoriza o progresso da partida (`WAITING_PLAYERS`, `PLAYING`, `SEASON_ENDED`, `FINISHED`), e o `BackendPlayer`, que gere a mão, expedições e pontuações individuais.

### 2. Domínio do Jogo (`/src/app`)

Lógica específica da interface e componentes de alto nível.

* **Tipagens Locais**: Definições de cores (`red`, `blue`, `green`, `yellow`, `purple`) e funções das cartas (`excavation`, `transport`, `research`, `funding`, `artifact`, `monkey`).
* **Gestão de Expedições**: Estruturas para validar líderes e cartas jogadas na mesa.

### 3. Design System (`/src/styles`)

Uma implementação de vanguarda focada em acessibilidade e estética:

* **`theme.css`**: Centraliza o uso de **OKLCH**, permitindo uma manipulação de cores mais natural e uniforme.
* **Dark Mode**: Suporte nativo completo através da classe `.dark`, adaptando todas as superfícies e tons de gráficos.
* **Tipografia**: Escalas definidas para garantir legibilidade em todos os níveis de cabeçalhos e elementos de formulário.

## 📋 Funcionalidades da Interface

* **Sincronização de Estado**: Visualização em tempo real do baralho, mercado aberto e trilhas de pontuação.
* **Feedback Visual de Turno**: Bloqueio de ações e indicadores visuais baseados no `current_turn_player_id`.
* **Visualização de Sítios**: Renderização adaptativa para configurações de sítios Lado A e Lado B.
* **Gestão de Mão**: Interface intuitiva para compra de cartas (deck ou mercado) e organização de expedições.

## 🚀 Configuração de Desenvolvimento

1. **Ambiente**:
Copie o ficheiro de exemplo para definir a URL do backend:
```bash
cp .env.example .env

```


2. **Instalação e Execução**:
```bash
npm install
npm run dev

```


3. **Compilação**:
```bash
npm run build

```
