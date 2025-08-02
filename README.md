# 🏎️ F1 Analytics

> **Análises inteligentes e previsões precisas da Fórmula 1 powered by AI**

Uma Progressive Web App (PWA) moderna para fãs de Fórmula 1 que querem acompanhar classificações, resultados e previsões em tempo real com dados meteorológicos integrados.

![F1 Analytics Logo](./public/Logo%20F1%20Analytics.svg)

## ✨ Características

- 📊 **Classificações ao vivo** - Pilotos e construtores atualizados
- 🏆 **Previsões de campeonato** - IA avançada para predições precisas
- 🌤️ **Previsão do tempo real** - Dados meteorológicos para cada GP via OpenWeatherMap API
- 📱 **PWA completa** - Instale como app nativo no seu dispositivo
- 🌐 **Funcionamento offline** - Acesse dados mesmo sem internet
- 🎯 **Interface moderna** - Design responsivo e intuitivo
- ⚡ **Performance otimizada** - Carregamento rápido e eficiente
- 🔄 **Dados em tempo real** - APIs de F1 e meteorologia integradas

## 🌤️ Novidade: Integração Meteorológica

- **Previsão de 3 dias** para cada fim de semana de GP
- **Dados reais** via OpenWeatherMap API (gratuita)
- **Mapeamento automático** de circuitos para localização
- **Fallback inteligente** com dados simulados se API não configurada
- **Cache otimizado** para reduzir chamadas da API

📖 **[Guia de configuração da API de meteorologia](./WEATHER-API-SETUP.md)**

## 🚀 Tecnologias

- **React 18** + **TypeScript**
- **Vite** - Build tool moderna
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes de UI
- **React Router** - Navegação SPA
- **Tanstack Query** - Gerenciamento de estado server
- **Lucide React** - Ícones
- **PWA** - Service Worker + Manifest

## 🛠️ Instalação

```sh
# Clone o repositório
git clone https://github.com/yurivfernandes/formula-one-oracle-project.git

# Entre no diretório
cd formula-one-oracle-project

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📱 Como usar como PWA

### Mobile (Android/iOS)
1. Acesse o site no navegador
2. Toque no menu do navegador
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

### Desktop (Chrome/Edge/Safari)
1. Acesse o site
2. Procure pelo ícone de instalação na barra de endereços
3. Clique em "Instalar F1 Analytics"
4. O app será adicionado ao seu sistema

## 🎨 Design System

### Cores Principais
- **Vermelho F1**: `#dc2626` - Cor principal da marca
- **Vermelho Escuro**: `#b91c1c` - Hover states
- **Branco**: `#ffffff` - Background principal
- **Cinzas**: `#374151`, `#6b7280`, `#9ca3af` - Textos e elementos

### Tipografia
- **Fonte Principal**: System fonts (Inter, Segoe UI, etc.)
- **Tamanhos**: Escala responsiva com Tailwind CSS

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/01c484f5-69d6-4f2a-934f-6a00158eac0c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/01c484f5-69d6-4f2a-934f-6a00158eac0c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
