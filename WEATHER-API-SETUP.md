# Configuração da API de Meteorologia

Este projeto integra dados meteorológicos reais usando a API do OpenWeatherMap para fornecer previsões precisas para os fins de semana de corrida da Fórmula 1.

## Como Configurar

### 1. Obter API Key (Gratuita)

1. Acesse [OpenWeatherMap API](https://openweathermap.org/api)
2. Clique em "Sign Up" para criar uma conta gratuita
3. Confirme seu email
4. Acesse o painel e copie sua API key

### 2. Configurar no Projeto

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Abra o arquivo `.env` e adicione sua API key:
   ```bash
   VITE_OPENWEATHER_API_KEY=sua_api_key_aqui
   ```

### 3. Limitações da Conta Gratuita

- **1.000 chamadas por mês** (mais que suficiente para este projeto)
- **60 chamadas por minuto**
- **Previsão de 5 dias** com dados a cada 3 horas
- **Dados históricos limitados**

## Funcionalidades

### 🌤️ Dados Meteorológicos Reais
- Temperatura atual, mínima e máxima
- Umidade do ar
- Velocidade do vento
- Condições climáticas (ensolarado, nublado, chuvoso, etc.)
- Probabilidade de chuva

### 🏎️ Integração com F1
- Mapeamento automático de circuitos para cidades
- Coordenadas precisas dos locais das corridas
- Previsão específica para os 3 dias do fim de semana de corrida

### 🛡️ Fallback Inteligente
- Se a API não estiver configurada, usa dados simulados
- Retry automático em caso de erro
- Cache de 30 minutos para reduzir chamadas

## Mapeamento de Circuitos

O sistema mapeia automaticamente os circuitos de F1 para as cidades/coordenadas corretas:

- **Albert Park** → Melbourne, Austrália
- **Circuit de Monaco** → Monte-Carlo, Mônaco
- **Silverstone Circuit** → Silverstone, Reino Unido
- **Circuit Gilles Villeneuve** → Montreal, Canadá
- E muito mais...

## Como Funciona

1. **Busca do Próximo GP**: API da Ergast para próxima corrida
2. **Mapeamento de Localização**: Circuito → Cidade → Coordenadas
3. **Consulta Meteorológica**: OpenWeatherMap API
4. **Processamento**: Tradução e formatação dos dados
5. **Exibição**: Interface integrada na home page

## Sem API Key?

Se você não configurar a API key, o sistema funcionará normalmente com dados simulados (aleatórios), mantendo toda a funcionalidade visual.

## Estrutura de Dados

```typescript
interface WeatherData {
  day: string;                // "Sexta-feira", "Sábado", "Domingo"
  date: string;              // "15/06"
  temperature: number;       // 24°C
  temperatureMin: number;    // 18°C
  temperatureMax: number;    // 28°C
  humidity: number;          // 65%
  windSpeed: number;         // 12 km/h
  condition: string;         // "sunny", "cloudy", "rainy"
  description: string;       // "Parcialmente nublado"
  chanceOfRain: number;      // 30%
  icon: string;             // "02d" (código do ícone)
}
```

## Custos

- **OpenWeatherMap**: Totalmente **GRATUITO** para este uso
- **Sem custos adicionais** de hospedagem ou infraestrutura
- **Sem limite de usuários** (limite é por API key, não por usuário)

---

🏎️ **Agora você tem previsões meteorológicas reais para cada GP da Fórmula 1!**
