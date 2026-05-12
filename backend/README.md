# Archeos Society - Backend Engine 🧭

Este diretório contém o motor de jogo (engine) e a API REST para o **Archeos Society**. O sistema gerencia desde a criação de partidas até a pontuação final, garantindo a integridade das regras, persistência de dados e a segurança dos turnos.

## 🚀 Tecnologias Utilizadas

* **Python 3.11**: Linguagem base do projeto utilizando imagem enxuta (slim) para produção.


* **FastAPI**: Framework web moderno e de alta performance utilizado para construir a API REST.


* **Pydantic**: Validação de dados de entrada/saída e definições dos schemas do domínio do jogo.


* **SQLAlchemy & SQLite**: ORM e banco de dados adotado para o MVP, convertendo e persistindo o estado completo das partidas (GameSession) em formato JSON.


* **Uvicorn**: Servidor ASGI que expõe a aplicação na porta 8000.


* **Pytest**: Framework para testes automatizados unitários e de integração.


* **Docker**: Conteinerização configurada com multi-stage build (`builder` e imagem final) para otimização.



## 🏗️ Arquitetura do Projeto

O projeto segue uma estrutura modular para separar a lógica de negócio, persistência de dados e interface de comunicação:

* **`/app/models/`**: Contém as definições do domínio (Domain Models), como classes de `Player`, `Card`, `Expedition`, Enums de cores/lados dos sítios e as tabelas oficiais de pontuação.


* **`/app/core/game_engine.py`**: O núcleo das regras de negócio. Controla o setup de temporadas, mecânica de particionamento e embaralhamento dos macacos, validação de líderes de expedição e cálculos de vitória.


* **`/app/api/`**: Camada de roteamento separada em duas frentes:
* `routes_game.py`: Gestão macro das partidas (criação, obtenção de resumo de vitória, preparação de nova temporada e envio de expedições à mesa).


* `routes_turn.py`: Ações de micro-gerenciamento de turnos, como comprar cartas do mercado aberto ou do deck oculto.




* **`/app/db/`**: Configuração do banco SQLite (`database.py`) e métodos de repositório (`repository.py`) para injetar e recuperar o JSON com o estado da partida.


* **`/tests/`**: Suite de testes contemplando rotas, o banco de dados e simulações detalhadas do motor de jogo.



## 📋 Funcionalidades Implementadas

### Regras Funcionais (RF)

* **Gestão de Partida**: Criação de partidas suportando de 2 a 6 jogadores, montagem automática de baralho baseado em 6 papéis escolhidos e definição do limite de temporadas.


* **Mecânica de Temporadas (Macacos)**: Particionamento do deck para distribuir 3 "Cartas de Macaco" na metade inferior do baralho. O encontro do 3º macaco encerra imediatamente a temporada, limpando o mercado e a mesa.


* **Expedições e Especialistas**: Validação rigorosa de correspondência por cor ou função. Integração dos bônus de diversos papéis como Guia, Médico, Professor, Fotógrafo, Cartógrafo (concessão de turno extra) e as restrições e vantagens do Mercenário e do Estudante.


* **Trilhas e Sítios (Lados A/B)**: Controle de movimentação dos veículos. Pontuação adaptada às configurações do mapa, incluindo cálculos para os lados Básicos (A) e Avançados (B), como os bônus de Chichén Itzá, Uluru, Tantallon e Ta-Sekhet-Ma'at.


* **Vitória e Desempate**: Ao final do jogo, a engine calcula a pontuação total (expedições + trilhas + bônus de relíquias/botânico) e resolve empates favorecendo o jogador com a maior expedição.



### Regras Não Funcionais (RNF)

* **RNF09 (Segurança de Turno)**: Controle rigoroso que lança exceções de bloqueio caso um jogador tente realizar ações financeiras (compras ou expedições) fora de sua vez.



## 🛠️ Como Executar

### Via Docker (Recomendado)

A aplicação está configurada para gerar imagens limpas utilizando a definição do arquivo `pyproject.toml`.

1. Na raiz do projeto, construa a imagem:
```bash
docker build -t archeos-backend .

```




2. Inicie o contêiner expondo a porta de tráfego:
```bash
docker run -p 8000:8000 archeos-backend

```




3. Acesse a documentação interativa automática do Swagger em: `http://localhost:8000/docs`.



### Execução Local (Python venv)

1. Crie e ative um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

```




2. Instale o pacote e suas dependências diretamente via arquivo de projeto oficial:
```bash
pip install --user --no-cache-dir .

```




3. Inicie o servidor FastAPI:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

```





## 🧪 Testes Automatizados

O sistema conta com forte cobertura abordando cenários normais e limites de regras (exceder 10 cartas na mão, bloqueios de mercenário como líder, desempates).

Para executar todos os testes, basta rodar:

```bash
pytest -v

```

## 📊 Rastreabilidade e Cobertura de Requisitos

A suíte de testes automatizados do backend foi construída com foco em garantir que todas as regras de negócio e restrições descritas no documento de requisitos sejam rigorosamente respeitadas. 

Atualmente, a engine conta com **100% de aprovação** em seus cenários de teste, mapeando diretamente o código aos Requisitos Funcionais (RF) e Não Funcionais (RNF) do MVP. 

Abaixo, destacamos a rastreabilidade entre alguns dos principais requisitos e a cobertura de código implementada:

### 🎮 Gestão de Partida e Turnos
* **RF01 (Criar partida com 2 a 6 jogadores):** Coberto por `test_deve_criar_partida_com_3_jogadores` e `test_nao_deve_permitir_menos_de_2_jogadores`.
* **RF12 / RF16 (Limite de 10 cartas na mão):** Garantido por `test_deve_impedir_compra_quando_limite_de_10_cartas_for_atingido` e `test_endpoint_draw_limite_de_mao_excedido`.
* **RNF09 (Controle de turno seguro):** Validado estritamente em `test_deve_impedir_acao_fora_do_turno`, bloqueando ações de jogadores na vez errada.

### 🐒 Mecânica de Macacos e Temporadas
* **RF20 / RF34 (Encerrar temporada no terceiro macaco):** Coberto nativamente pela engine e validado por `test_deve_encerrar_temporada_ao_encontrar_terceiro_macaco` e `test_endpoint_draw_deck_revela_terceiro_macaco`.
* **RF35 / RF40 (Reset e transição até o fim do jogo):** Testado por `test_deve_resetar_cartas_entre_temporadas`, `test_deve_transitar_entre_temporadas_ate_fim_do_jogo` e `test_deve_finalizar_jogo_apos_limite_de_temporadas`.

### 🧭 Expedições, Trilhas e Habilidades
* **RF23 (Validação de Expedição por Cor/Função):** Coberto por `test_jogar_expedicao_valida_por_cor` e `test_rejeitar_expedicao_invalida`.
* **RF28 (Aplicar efeitos de papéis):** Ampla cobertura das habilidades, incluindo:
  * *Cartógrafo:* `test_cartografo_concede_turno_extra`
  * *Guia:* `test_guia_deve_permitir_avanco_mesmo_sem_atingir_threshold`
  * *Mercenário:* `test_mercenario_nao_pode_ser_lider` e `test_mercenario_funciona_como_coringa`
  * *Botânico:* `test_botanico_transfere_controle_da_moldura` e `test_fim_temporada_pontua_botanico`
* **RF33 (Efeitos de Sítios Arqueológicos):** Testado nas regras de pontuação complexa, como `test_deve_aplicar_bonus_de_compra_em_chichen_itza_avancado`, `test_uluru_avancado_permite_reset_e_pontuacao_imediata` e `test_ta_sekhet_maat_deve_pontuar_apenas_veiculo_mais_atrasado`.

### 🏁 Condições de Vitória
* **RF38 (Cálculo de pontos de expedição):** Validado na função core através de `test_deve_calcular_pontuacao_de_expedicao_corretamente`.
* **RF42 (Desempate por maior expedição):** Coberto especificamente no fim da partida por `test_deve_determinar_vencedor_por_desempate_de_maior_expedicao`.
