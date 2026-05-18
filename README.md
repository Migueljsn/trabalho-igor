# Trabalho Final Mobile - OrganizaTarefas

Aplicativo criado para o trabalho final da disciplina de Desenvolvimento para Dispositivos Móveis.

Alunos: 

Luís Guilherme de Oliveira Caminha Leal - 01800544
Heryck Bryan Oliveira Pacheco - 01801743
Diego Guimarães marinho - 01776415
Ana Jéssica Siqueira Silva Rocha - 01830519
Miguel José de Sousa Neto - 01824955

O projeto usa React Native com Expo e simula um aplicativo de gerenciamento de tarefas. O código está comentado para facilitar o estudo e a apresentação.

## Funcionalidades

- Tela de login.
- Tela de cadastro.
- Tela principal com lista de tarefas usando `FlatList`.
- Tela para adicionar tarefa.
- Tela de detalhes para editar, concluir ou excluir tarefa.
- Tela de configurações com modo escuro e notificações.
- Uso de `View`, `Text`, `TextInput`, `TouchableOpacity`, `FlatList`, `Image`, `Switch` e layout com Flexbox.
- Navegação entre telas usando estado do React.

## Como executar

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run dev
```

Depois disso, é possível abrir no celular com o aplicativo Expo Go ou executar no navegador usando a opção para web do Expo.

## Deploy no EasyPanel

Este é um projeto Expo/React Native. Para publicar como site no EasyPanel, ele precisa ser exportado para web e servido como arquivos estáticos.

Use o deploy com Nixpacks. O arquivo `nixpacks.toml` já define:

- Node 20, necessário para as versões atuais do Supabase.
- `npm ci` para instalar as dependências.
- `npm run build` para gerar a pasta `dist`.
- `npm run start` para servir a pasta `dist` em `0.0.0.0:$PORT`.

No EasyPanel, mantenha o app como Nixpacks e faça redeploy do commit mais recente. Se precisar configurar manualmente:

```bash
Build command: npm run build
Start command: npm run start
Port: usar a variável PORT do EasyPanel
```

Para testar localmente o mesmo fluxo de produção:

```bash
npm run build
PORT=3000 npm run start
```

## Estrutura principal

- `App.js`: contém todas as telas e regras do aplicativo.
- `src/lib/supabase.js`: cria a conexão do app com o Supabase.
- `supabase/tasks.sql`: script SQL da tabela usada pelo aplicativo.
- `APRESENTACAO.md`: roteiro completo para explicar o projeto.
- `package.json`: lista dependências e comandos do projeto.
- `app.json`: configurações básicas do Expo.
- `babel.config.js`: configuração usada pelo Expo para compilar o app.

## Telas desenvolvidas

1. Login
2. Cadastro
3. Principal
4. Adicionar tarefa
5. Detalhes da tarefa
6. Configurações

## Integrantes e responsabilidades

Preencha com os nomes do grupo:

| Integrante | Responsabilidade |
| --- | --- |
| Nome 1 | Tela de login e cadastro |
| Nome 2 | Tela principal e lista de tarefas |
| Nome 3 | Cadastro e edição de tarefas |
| Nome 4 | Configurações e tema |
| Nome 5 | README, capturas de tela e apresentação |

## Banco de dados

O projeto tem uma conexão simples com Supabase para salvar, listar, editar e excluir tarefas.

Crie a tabela abaixo no SQL Editor do Supabase ou execute o arquivo `supabase/tasks.sql`:

```sql
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default 'Sem descrição.',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Permitir leitura publica de tarefas"
on public.tasks for select
using (true);

create policy "Permitir criacao publica de tarefas"
on public.tasks for insert
with check (true);

create policy "Permitir edicao publica de tarefas"
on public.tasks for update
using (true)
with check (true);

create policy "Permitir exclusao publica de tarefas"
on public.tasks for delete
using (true);
```

O app usa apenas a chave pública do Supabase. Nunca coloque a chave `service_role` dentro do aplicativo.

## Capturas de tela

Adicione aqui as capturas de tela antes de enviar o repositório:

- Login
- Cadastro
- Principal
- Adicionar tarefa
- Detalhes
- Configurações
