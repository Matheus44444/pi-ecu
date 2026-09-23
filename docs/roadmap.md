# Roadmap do Pi-ECU

## Fase atual

Dashboard web em modo de simulação.

## Funcionalidades prontas

- [x] Projeto Git configurado
- [x] Dashboard web local
- [x] Telemetria simulada
- [x] RPM, MAP e Lambda
- [x] Gráfico de RPM e MAP
- [x] Tema escuro racing
- [x] Layout responsivo para computador e celular

## Próximas etapas de software

- [ ] Adicionar TPS simulado
- [ ] Adicionar ECT simulado
- [ ] Adicionar IAT simulada
- [ ] Adicionar tensão da bateria simulada
- [ ] Adicionar pressão de óleo simulada
- [ ] Adicionar pressão de combustível simulada
- [ ] Criar alarmes visuais
- [ ] Criar modo pausar/iniciar simulação
- [ ] Criar tela de configurações
- [ ] Salvar preferências com localStorage
- [ ] Exportar sessão simulada em CSV
- [ ] Criar API mock
- [ ] Criar logger local

## Próximas etapas de hardware

- [ ] Definir Raspberry Pi para bancada
- [ ] Definir placa STM32 para bancada
- [ ] Definir simulador de roda fônica
- [ ] Definir leitura de sensores em bancada
- [ ] Criar comunicação STM32 ↔ Raspberry Pi
- [ ] Criar BOM inicial
- [ ] Projetar PCB somente após testes de bancada

## Segurança

Nesta etapa o projeto é somente software.

- Não conectar ao carro.
- Não conectar ao chicote FuelTech.
- Não controlar bobinas.
- Não controlar injetores.
- Não usar fonte automotiva.
- Não usar saídas de potência.
