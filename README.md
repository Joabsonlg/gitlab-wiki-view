# GitLab Wiki Viewer

## Sobre o Projeto

O GitLab Wiki Viewer é uma aplicação web moderna para visualizar e navegar pela documentação wiki dos seus projetos GitLab de forma simples e eficiente. Desenvolvido com tecnologias modernas para oferecer uma experiência de usuário fluida e responsiva.

**Autor**: Joabson

## Tecnologias Utilizadas

- **Vite** - Build tool rápido e moderno
- **React** - Biblioteca para criação de interfaces de usuário
- **TypeScript** - Superset do JavaScript com tipagem estática
- **shadcn/ui** - Componentes de UI modernos e acessíveis
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento para aplicações React
- **Axios** - Cliente HTTP para requisições
- **React Query** - Gerenciamento de estado para requisições
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas TypeScript

## Como Executar Localmente

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Joabsonlg/gitlab-wiki-view.git

# Navegue para o diretório do projeto
cd gitlab-wiki-view

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter para verificar a qualidade do código

## Deploy no GitHub Pages

Este projeto está configurado para deploy automático no GitHub Pages através do GitHub Actions.

### Configuração Automática

1. Faça push do código para o repositório no GitHub
2. Vá em **Settings** > **Pages** no seu repositório
3. Selecione **GitHub Actions** como source
4. O deploy será executado automaticamente a cada push na branch `main`

### URL de Acesso

Após o deploy, a aplicação estará disponível em:
`https://joabsonlg.github.io/gitlab-wiki-view/`

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI reutilizáveis
│   ├── LoginPage.tsx   # Página de login
│   ├── ProjectSelector.tsx  # Seletor de projetos
│   └── WikiViewer.tsx  # Visualizador de wiki
├── hooks/              # Custom hooks
├── lib/                # Utilitários e helpers
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
└── types/              # Definições de tipos TypeScript
```

## Funcionalidades

- 🔐 Autenticação com GitLab
- 📁 Seleção de projetos
- 📖 Visualização de páginas wiki
- 🎨 Interface moderna e responsiva
- 🌙 Suporte a tema escuro/claro
- 📱 Design mobile-first

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

Desenvolvido com ❤️ por Joabson
