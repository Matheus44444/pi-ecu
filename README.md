# Pi-ECU

> Base de desenvolvimento para uma futura plataforma de telemetria, dashboard e calibração de sistemas automotivos, iniciando em **modo de simulação** e evoluindo gradualmente para testes de bancada com Raspberry Pi, STM32 e sensores.

## Status atual

**Etapa 1 — Dashboard web simulado**

O projeto está propositalmente na fase de software. Nenhum microcontrolador, Raspberry Pi, sensor, injetor, bobina ou sinal automotivo é necessário para executar esta etapa.

A interface web exibe dados de telemetria simulados para validar o layout, a experiência de uso e a arquitetura inicial antes de conectar hardware real.

### O que já funciona

- Dashboard web local com React e Vite
- Simulação de telemetria atualizada periodicamente
- Indicadores de RPM, MAP e Lambda
- Gráfico histórico de RPM e pressão MAP
- Estrutura inicial de uma API em FastAPI
- Projeto isolado em Git

### O que ainda não faz

- Não lê sensores físicos
- Não se comunica com Raspberry Pi, ESP32 ou STM32
- Não recebe CAN
- Não controla injeção, ignição, relés, bombas, bobinas ou válvulas
- Não deve ser conectado ao chicote do carro nesta fase

## Objetivo do projeto

Construir, de forma incremental e segura, uma plataforma voltada a:

1. Visualização de telemetria em tempo real
2. Registro de dados para análise posterior
3. Configuração e calibração por interface web
4. Comunicação com um microcontrolador dedicado ao tempo real
5. Testes em bancada antes de qualquer integração automotiva

A arquitetura pretendida separa responsabilidades:

```text
┌─────────────────────────────────────────────────────────┐
│ Dashboard Web                                             │
│ React + Vite                                              │
│ Mostra gráficos, indicadores e telas de configuração      │
└──────────────────────────────┬──────────────────────────┘
                               │ HTTP / WebSocket
┌──────────────────────────────▼──────────────────────────┐
│ API / Logger                                              │
│ Python + FastAPI                                          │
│ Telemetria, configuração, logs e comunicação              │
└──────────────────────────────┬──────────────────────────┘
                               │ SPI / UART / CAN
┌──────────────────────────────▼──────────────────────────┐
│ Hardware futuro                                           │
│ STM32: funções críticas de tempo real                     │
│ Raspberry Pi: interface, logs e serviços Linux            │
└─────────────────────────────────────────────────────────┘
```

> O STM32 será responsável por tarefas críticas de tempo real somente depois dos testes de bancada. O dashboard e o Raspberry Pi não devem ser usados para comandar diretamente funções críticas de motor.

## Estrutura do repositório

```text
pi-ecu/
├── README.md                 # Documento principal do projeto
├── docs/                     # Diário, decisões e documentação técnica
├── hardware/                 # Pinout, BOM e esquemáticos futuros
└── pi/
    ├── pyproject.toml        # Dependências da API Python
    ├── src/pi_ecu/
    │   └── api.py            # API FastAPI inicial
    └── web/
        ├── package.json      # Dependências da interface web
        └── src/
            ├── main.jsx      # Dashboard e dados simulados
            └── style.css     # Estilos do dashboard
```

## Executar o dashboard

### Pré-requisitos

- Linux, Windows ou macOS
- Node.js e npm
- Navegador web moderno

Para instalar Node.js e npm no Linux baseado em Debian/Ubuntu:

```bash
sudo apt update
sudo apt install -y nodejs npm
```

Confira a instalação:

```bash
node --version
npm --version
```

### Iniciar a interface

No terminal:

```bash
cd ~/Downloads/pi-ecu/pi/web
npm install
npm run dev
```

O terminal deverá exibir um endereço semelhante a:

```text
http://localhost:5173
```

Abra esse endereço no navegador.

### Resultado esperado

Mesmo sem hardware conectado, a tela deve mostrar:

- RPM iniciando perto de 800 e variando
- MAP iniciando perto de 100 kPa e variando
- Lambda próxima de 1.00
- Pontos novos no gráfico aproximadamente a cada segundo
- Indicação de que o painel está em modo de simulação

Se a página não atualizar após salvar uma edição, use `Ctrl + R` no navegador ou pare o Vite com `Ctrl + C` e execute `npm run dev` novamente.

## Executar a API opcional

A API ainda é apenas uma base para as próximas etapas. O dashboard em modo simulação não depende dela.

```bash
cd ~/Downloads/pi-ecu/pi
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
PYTHONPATH=src uvicorn pi_ecu.api:app --reload --port 8000
```

Depois, abra:

```text
http://localhost:8000/docs
```

Essa página disponibiliza a documentação interativa dos endpoints da API.

## Desenvolvimento no VS Code

Abra a raiz do projeto:

```bash
code ~/Downloads/pi-ecu
```

Os arquivos mais importantes nesta etapa são:

| Arquivo | Finalidade |
|---|---|
| `pi/web/src/main.jsx` | Lógica do dashboard e telemetria simulada |
| `pi/web/src/style.css` | Aparência do painel |
| `pi/src/pi_ecu/api.py` | Endpoints iniciais da API Python |
| `docs/diario.md` | Registro das decisões e progresso |
| `.gitignore` | Arquivos locais que não devem ir para o Git |

## Git e versionamento

O repositório Git deve existir **somente dentro da pasta `pi-ecu`**.

Para registrar alterações:

```bash
cd ~/Downloads/pi-ecu
git status
git add -A
git commit -m "feat: descreve a alteracao realizada"
```

Exemplo para a etapa atual:

```bash
git commit -m "feat: dashboard em modo simulacao"
```

Nunca execute `git init` ou `git add -A` diretamente em `~` (`/home/matheus`), pois isso pode tentar incluir arquivos pessoais e caches do sistema.

## Próximas etapas

### Etapa 2 — Melhorar a simulação

- Adicionar TPS
- Adicionar temperatura do motor (ECT)
- Adicionar temperatura do ar (IAT)
- Adicionar tensão de bateria
- Adicionar pressão de combustível
- Criar alarmes visuais para valores fora da faixa
- Criar seleção de modo: simulação ou hardware

### Etapa 3 — Telemetria por API

- Fazer o dashboard consumir dados da API FastAPI
- Criar endpoint WebSocket
- Registrar telemetria em CSV ou SQLite
- Permitir salvar e carregar uma sessão de teste

### Etapa 4 — Bancada eletrônica

- Definir a placa STM32 de teste
- Criar simulador de sinais de RPM/roda fônica
- Ler potenciômetros como TPS/MAP simulados
- Testar comunicação STM32 ↔ Raspberry Pi
- Validar tudo com LEDs e cargas de baixa potência

### Etapa 5 — Hardware automotivo

Somente após os testes de bancada, estudar condicionamento de sinais, proteção elétrica, fontes automotivas, CAN, conectores e uma PCB própria.

## Segurança

Este projeto está em desenvolvimento e **não é uma ECU pronta para uso em veículo**.

- Não conecte as saídas do projeto a bobinas ou injetores.
- Não use a interface web, Raspberry Pi ou código de simulação para controlar motor.
- Não conecte o projeto ao chicote FuelTech nesta etapa.
- Em futuros testes de bancada, comece com fonte limitada em corrente, fusível adequado, LEDs e cargas simuladas.
- Qualquer integração com veículo deve ser passiva no início: apenas leitura de sinais adequadamente condicionados e isolados.

## Diário do projeto

Mantenha decisões e testes em [`docs/diario.md`](docs/diario.md). Um registro simples evita que você perca contexto ao evoluir o projeto aos poucos.

## Licença

Ainda não definida. Até definir uma licença, considere este repositório de uso pessoal e experimental.