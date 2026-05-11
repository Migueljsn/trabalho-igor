# Trabalho Final Mobile - OrganizaTarefas

Aplicativo criado para o trabalho final da disciplina de Desenvolvimento para Dispositivos Móveis.

O projeto usa React Native com Expo e simula um aplicativo de gerenciamento de tarefas. O código está comentado para facilitar o estudo e a apresentação.

## Funcionalidades

- Tela de login.
- Tela de cadastro.
- Tela principal com lista de tarefas usando `FlatList`.
- Tela para adicionar tarefa.
- Tela de detalhes para editar, concluir ou excluir tarefa.
- Tela de configurações com modo escuro e notificações.
- Uso de `View`, `Text`, `TextInput`, `Button`, `FlatList`, `Image`, `Switch` e layout com Flexbox.
- Navegação entre telas usando estado do React.

## Como executar

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm start
```

Depois disso, é possível abrir no celular com o aplicativo Expo Go ou executar no navegador usando a opção para web do Expo.

## Estrutura principal

- `App.js`: contém todas as telas e regras do aplicativo.
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

Nesta versão, os dados ficam em memória usando `useState`, para deixar o código mais simples para estudo.

Para ganhar o ponto extra de banco de dados, uma melhoria possível é integrar Firebase, Supabase ou Appwrite. A ideia seria substituir as funções `handleAddTask`, `handleUpdateTask` e `handleDeleteTask` por chamadas ao banco de dados.

## Capturas de tela

Adicione aqui as capturas de tela antes de enviar o repositório:

- Login
- Cadastro
- Principal
- Adicionar tarefa
- Detalhes
- Configurações
