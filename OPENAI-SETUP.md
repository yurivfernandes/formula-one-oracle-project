# Configuração da Análise AI com OpenAI

## Como configurar a API OpenAI

Para usar a análise preditiva com GPT-3.5 Turbo, você precisa configurar sua chave da API OpenAI.

### 1. Obter a Chave da API

1. Acesse [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave gerada (comece com `sk-...`)

### 2. Configurar no Projeto

#### Para Desenvolvimento Local:

1. Renomeie o arquivo `.env.example` para `.env`
2. Abra o arquivo `.env`
3. Substitua `your_openai_api_key_here` pela sua chave:
   ```
   VITE_OPENAI_API_KEY=sk-sua-chave-aqui
   ```

#### Para Deploy na Vercel:

1. Acesse o dashboard da Vercel
2. Vá para seu projeto
3. Clique em "Settings" > "Environment Variables"
4. Adicione a variável:
   - **Name**: `VITE_OPENAI_API_KEY`
   - **Value**: `sk-sua-chave-aqui`
   - **Environment**: Production (e Development se desejar)

### 3. Configurações Opcionais

Você pode ajustar o comportamento da IA editando as seguintes variáveis no `.env`:

```env
# Modelo da OpenAI (recomendado: gpt-3.5-turbo)
VITE_OPENAI_MODEL=gpt-3.5-turbo

# Máximo de tokens por resposta
VITE_OPENAI_MAX_TOKENS=2000

# Criatividade da resposta (0.0 a 1.0)
VITE_OPENAI_TEMPERATURE=0.7
```

### 4. Como Usar

1. Acesse a página de "Previsões"
2. Se configurado corretamente, você verá o botão "Análise com GPT-3.5"
3. Clique no botão para gerar uma análise preditiva baseada nos dados atuais
4. A análise será atualizada automaticamente após cada GP

### 5. Controle de Custos

- A análise usa o modelo `gpt-3.5-turbo` que é mais econômico
- Cada análise consome aproximadamente 1500-2500 tokens
- Recomenda-se gerar análises apenas após corridas importantes
- Monitore seu uso no [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### 6. Troubleshooting

#### Erro: "API OpenAI não configurada"
- Verifique se a variável `VITE_OPENAI_API_KEY` está configurada
- Certifique-se de que não há espaços em branco na chave

#### Erro: "Chave da API OpenAI inválida"
- Verifique se a chave está correta e ativa
- Confirme se há créditos disponíveis na sua conta OpenAI

#### Erro: "Cota da API OpenAI excedida"
- Adicione créditos à sua conta OpenAI
- Ou aguarde o reset mensal se usando o free tier

### 7. Funcionalidades da Análise AI

A análise preditiva incluirá:

- **Análise do Campeonato de Pilotos**: Chances de cada piloto ser campeão
- **Análise do Campeonato de Construtores**: Previsões para as equipes
- **Previsões Finais**: Posições esperadas do top 5 pilotos e top 3 construtores
- **Fatores Decisivos**: Elementos que podem definir o campeonato
- **Cenários Possíveis**: Diferentes possibilidades para o final da temporada

A análise é baseada nos dados reais da temporada 2025 e é atualizada apenas após cada Grande Prêmio.
