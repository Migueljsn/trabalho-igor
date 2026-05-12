import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "./src/lib/supabase";

// Este projeto foi escrito em um único arquivo para facilitar o estudo.
// Em um projeto maior, cada tela poderia ficar em uma pasta como src/screens.
// A proposta aqui é deixar tudo visível para apresentação: telas, estados,
// funções de CRUD, conexão com Supabase e estilos.

// Imagem em formato PNG base64 para cumprir o requisito do componente Image
// sem depender de arquivo externo ou internet. Ela fica dentro do bloco visual
// da tela de login, seguindo a estética clara e arredondada do protótipo.
const APP_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

// Lista inicial para o aplicativo já abrir com dados visíveis na FlatList.
const INITIAL_TASKS = [
  {
    id: "1",
    title: "Criar protótipo no Figma",
    description: "Escolher um layout da comunidade e adaptar para o app.",
    done: true,
  },
  {
    id: "2",
    title: "Implementar tela principal",
    description: "Mostrar as tarefas usando FlatList.",
    done: false,
  },
  {
    id: "3",
    title: "Preparar apresentação",
    description: "Explicar componentes, navegação e organização do código.",
    done: false,
  },
];

export default function App() {
  // Este componente é o "controlador" principal do aplicativo.
  // Ele guarda os estados compartilhados e decide qual tela será exibida.

  // screen controla qual tela aparece. Isso simula a navegação entre telas
  // de forma bem simples para fins acadêmicos.
  const [screen, setScreen] = useState("login");

  // user guarda os dados básicos do usuário logado.
  const [user, setUser] = useState(null);

  // tasks é o "estado global" da lista de tarefas do app. Ele começa com
  // dados locais para a interface nunca abrir vazia durante o carregamento.
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // loadingTasks indica que o app está buscando dados no Supabase.
  const [loadingTasks, setLoadingTasks] = useState(false);

  // usingLocalData fica true quando o banco não está acessível ou a tabela
  // ainda não existe. Assim o app continua funcionando para demonstração.
  const [usingLocalData, setUsingLocalData] = useState(false);

  // selectedTaskId guarda qual tarefa foi escolhida na tela principal.
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // settings guarda preferências da tela de configurações.
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
  });

  // useMemo evita procurar a tarefa selecionada de novo em toda renderização
  // quando o id e a lista não mudaram.
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId),
    [selectedTaskId, tasks]
  );

  // Cores mudam conforme o modo escuro configurado pelo usuário.
  const theme = settings.darkMode ? darkTheme : lightTheme;

  // useEffect executa uma vez quando o app inicia. Aqui ele carrega as tarefas
  // salvas no Supabase e substitui a lista inicial caso a conexão funcione.
  useEffect(() => {
    loadTasks();
  }, []);

  // Busca as tarefas no Supabase. A tabela esperada chama-se public.tasks.
  async function loadTasks() {
    setLoadingTasks(true);

    // select escolhe apenas os campos usados pela tela. order coloca as
    // tarefas mais novas primeiro, usando a coluna created_at.
    const { data, error } = await supabase
      .from("tasks")
      .select("id,title,description,done")
      .order("created_at", { ascending: false });

    setLoadingTasks(false);

    if (error) {
      // Se ocorrer erro, mantemos os dados locais iniciais e avisamos na tela
      // principal com o texto "Modo local".
      setUsingLocalData(true);
      return;
    }

    setUsingLocalData(false);
    setTasks(data);
  }

  function handleLogin(email) {
    // Validação simples apenas para demonstrar regra de formulário.
    if (!email.includes("@")) {
      Alert.alert("Atenção", "Digite um e-mail válido para entrar.");
      return;
    }

    // O login é simulado para manter o projeto simples. Ele cria um usuário
    // local e leva o app para a tela principal.
    setUser({ name: "Estudante", email });
    setScreen("home");
  }

  function handleRegister(name, email) {
    // Cadastro também é simulado. O objetivo é cumprir a tela e demonstrar
    // validação básica de formulário, sem autenticação real.
    if (!name.trim() || !email.includes("@")) {
      Alert.alert("Atenção", "Preencha nome e e-mail corretamente.");
      return;
    }

    setUser({ name: name.trim(), email });
    setScreen("home");
  }

  async function handleAddTask(title, description) {
    // Antes de salvar no banco, o app valida se o campo obrigatório foi enviado.
    if (!title.trim()) {
      Alert.alert("Atenção", "O título da tarefa é obrigatório.");
      return;
    }

    // Objeto que será enviado para a tabela tasks no Supabase.
    const newTask = {
      title: title.trim(),
      description: description.trim() || "Sem descrição.",
      done: false,
    };

    // insert salva no banco e select retorna a tarefa criada com o id gerado.
    const { data, error } = await supabase
      .from("tasks")
      .insert(newTask)
      .select("id,title,description,done")
      .single();

    if (error) {
      // Fallback local: se o Supabase falhar, a tarefa entra na lista em memória.
      // Isso facilita a apresentação mesmo sem internet ou sem tabela criada.
      const localTask = { ...newTask, id: String(Date.now()) };
      setUsingLocalData(true);
      setTasks((currentTasks) => [localTask, ...currentTasks]);
      Alert.alert("Aviso", "Tarefa salva apenas no aparelho. Verifique a tabela tasks.");
      setScreen("home");
      return;
    }

    // Atualização otimista da interface depois do banco confirmar a criação.
    setUsingLocalData(false);
    setTasks((currentTasks) => [data, ...currentTasks]);
    setScreen("home");
  }

  async function handleUpdateTask(updatedTask) {
    // update altera apenas os campos editáveis da tarefa selecionada.
    const { error } = await supabase
      .from("tasks")
      .update({
        title: updatedTask.title.trim(),
        description: updatedTask.description.trim() || "Sem descrição.",
        done: updatedTask.done,
      })
      .eq("id", updatedTask.id);

    if (error) {
      setUsingLocalData(true);
      Alert.alert("Aviso", "Alteração feita apenas no aparelho. Verifique o Supabase.");
    } else {
      setUsingLocalData(false);
    }

    // Mesmo com falha remota, atualizamos a tela localmente para manter o fluxo
    // simples para o usuário.
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );

    setScreen("home");
  }

  async function handleDeleteTask(taskId) {
    // delete remove a tarefa no Supabase pelo id.
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      setUsingLocalData(true);
      Alert.alert("Aviso", "Exclusão feita apenas no aparelho. Verifique o Supabase.");
    } else {
      setUsingLocalData(false);
    }

    // Remove da interface local depois da tentativa de exclusão.
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    setSelectedTaskId(null);
    setScreen("home");
  }

  function handleLogout() {
    // Como o login é simulado, sair apenas limpa o usuário e volta ao início.
    setUser(null);
    setSelectedTaskId(null);
    setScreen("login");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.darkMode ? "light-content" : "dark-content"} />

      {/* Renderização condicional: apenas a tela escolhida pelo estado screen aparece. */}
      {screen === "login" && (
        <LoginScreen
          theme={theme}
          onLogin={handleLogin}
          onGoToRegister={() => setScreen("register")}
        />
      )}

      {screen === "register" && (
        <RegisterScreen
          theme={theme}
          onRegister={handleRegister}
          onBack={() => setScreen("login")}
        />
      )}

      {screen === "home" && (
        <HomeScreen
          theme={theme}
          user={user}
          tasks={tasks}
          loadingTasks={loadingTasks}
          usingLocalData={usingLocalData}
          onAdd={() => setScreen("add")}
          onOpenTask={(taskId) => {
            setSelectedTaskId(taskId);
            setScreen("details");
          }}
          onSettings={() => setScreen("settings")}
          onLogout={handleLogout}
        />
      )}

      {screen === "add" && (
        <AddTaskScreen
          theme={theme}
          onSave={handleAddTask}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "details" && selectedTask && (
        <TaskDetailsScreen
          theme={theme}
          task={selectedTask}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          theme={theme}
          settings={settings}
          onChangeSettings={setSettings}
          onBack={() => setScreen("home")}
        />
      )}
    </SafeAreaView>
  );
}

function LoginScreen({ theme, onLogin, onGoToRegister }) {
  // Tela inicial do aplicativo. Ela usa TextInput, TouchableOpacity, Image e navegação
  // por callback para entrar ou ir ao cadastro.

  // Cada TextInput precisa de um state para armazenar o que o usuário digitou.
  const [email, setEmail] = useState("aluno@faculdade.com");

  return (
    <ScrollView contentContainerStyle={styles.centeredContent}>
      <View style={styles.loginCard}>
        <Image source={{ uri: APP_IMAGE }} style={styles.heroImage} resizeMode="contain" />
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>✓</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>OrganizaTarefas</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Organize atividades, acompanhe pendências e prepare sua rotina de estudo.
      </Text>

      <Text style={[styles.label, { color: theme.text }]}>E-mail</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.input, borderColor: theme.border, color: theme.text },
        ]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Digite seu e-mail"
        placeholderTextColor={theme.muted}
      />

      <View style={styles.buttonGap}>
        <AppButton title="Entrar" theme={theme} onPress={() => onLogin(email)} />
      </View>

      <TouchableOpacity onPress={onGoToRegister} style={styles.textButton}>
        <Text style={[styles.link, { color: theme.primary }]}>Criar nova conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function RegisterScreen({ theme, onRegister, onBack }) {
  // Tela de cadastro simplificada. Não grava usuário no banco, porque o foco
  // do trabalho é a lista de tarefas e a conexão simples com Supabase.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Cadastro" theme={theme} onBack={onBack} />

      <Text style={[styles.label, { color: theme.text }]}>Nome</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.input, borderColor: theme.border, color: theme.text },
        ]}
        value={name}
        onChangeText={setName}
        placeholder="Seu nome"
        placeholderTextColor={theme.muted}
      />

      <Text style={[styles.label, { color: theme.text }]}>E-mail</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.input, borderColor: theme.border, color: theme.text },
        ]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="seu@email.com"
        placeholderTextColor={theme.muted}
      />

      <AppButton
        title="Cadastrar e entrar"
        theme={theme}
        onPress={() => onRegister(name, email)}
      />
    </ScrollView>
  );
}

function HomeScreen({
  theme,
  user,
  tasks,
  loadingTasks,
  usingLocalData,
  onAdd,
  onOpenTask,
  onSettings,
  onLogout,
}) {
  // Tela principal. Mostra resumo, estado da conexão e lista de tarefas.

  // Estatísticas calculadas a partir das tarefas atuais.
  const finishedCount = tasks.filter((task) => task.done).length;
  const pendingCount = tasks.length - finishedCount;

  return (
    <View style={styles.flexScreen}>
      <View style={styles.screenContent}>
        <View style={styles.homeHeader}>
          <View>
            <Text style={[styles.smallText, { color: theme.muted }]}>Bem-vindo</Text>
            <Text style={[styles.title, { color: theme.text }]}>{user?.name}</Text>
          </View>

          <TouchableOpacity onPress={onSettings} style={styles.roundButton}>
            <Text style={styles.roundButtonText}>•••</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryBox, { backgroundColor: theme.surface }]}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={[styles.summaryNumber, { color: theme.primary }]}>{tasks.length}</Text>
              <Text style={[styles.summaryText, { color: theme.text }]}>tarefas no total</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{finishedCount}</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${tasks.length ? (finishedCount / tasks.length) * 100 : 0}%` },
              ]}
            />
          </View>
          <View style={styles.summaryFooter}>
            <Text style={[styles.smallText, { color: theme.muted }]}>
              {finishedCount} concluídas • {pendingCount} pendentes
            </Text>
            <Text style={[styles.statusText, { color: usingLocalData ? theme.danger : theme.primary }]}>
              {loadingTasks ? "Carregando" : usingLocalData ? "Modo local" : "Online"}
            </Text>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Minhas tarefas</Text>
          <AppButton title="+ Nova" theme={theme} onPress={onAdd} compact />
        </View>
      </View>

      <FlatList
        // FlatList é usada porque ela é o componente recomendado para listas
        // em React Native, principalmente quando podem existir muitos itens.
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.muted }]}>
            Nenhuma tarefa cadastrada.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.taskCard, { backgroundColor: theme.surface }]}
            onPress={() => onOpenTask(item.id)}
          >
            <View style={styles.taskRow}>
              <Text style={[styles.taskTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.badge, item.done ? styles.doneBadge : styles.pendingBadge]}>
                {item.done ? "OK" : "Aberta"}
              </Text>
            </View>

            <Text style={[styles.taskDescription, { color: theme.muted }]}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <AppButton title="Sair" theme={theme} onPress={onLogout} variant="danger" />
      </View>
    </View>
  );
}

function AddTaskScreen({ theme, onSave, onBack }) {
  // Tela de criação. Cada campo do formulário é controlado por useState.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Adicionar tarefa" theme={theme} onBack={onBack} />

      <Text style={[styles.label, { color: theme.text }]}>Título</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.input, borderColor: theme.border, color: theme.text },
        ]}
        value={title}
        onChangeText={setTitle}
        placeholder="Ex.: Estudar React Native"
        placeholderTextColor={theme.muted}
      />

      <Text style={[styles.label, { color: theme.text }]}>Descrição</Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          { backgroundColor: theme.input, borderColor: theme.border, color: theme.text },
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Detalhe o que precisa ser feito"
        placeholderTextColor={theme.muted}
        multiline
      />

      <AppButton
        title="Salvar tarefa"
        theme={theme}
        onPress={() => onSave(title, description)}
      />
    </ScrollView>
  );
}

function TaskDetailsScreen({ theme, task, onSave, onDelete, onBack }) {
  // Tela de edição. Ela recebe a tarefa selecionada e inicia o formulário
  // com os valores atuais dessa tarefa.
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [done, setDone] = useState(task.done);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Detalhes" theme={theme} onBack={onBack} />

      <Text style={[styles.label, { color: theme.text }]}>Título</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.input, borderColor: theme.border, color: theme.text },
        ]}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { color: theme.text }]}>Descrição</Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          { backgroundColor: theme.input, borderColor: theme.border, color: theme.text },
        ]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: theme.text }]}>Tarefa concluída</Text>
        <Switch value={done} onValueChange={setDone} />
      </View>

      <View style={styles.buttonGap}>
        <AppButton
          title="Salvar alterações"
          theme={theme}
          onPress={() => onSave({ ...task, title, description, done })}
        />
      </View>

      <AppButton
        title="Excluir tarefa"
        theme={theme}
        onPress={() => onDelete(task.id)}
        variant="danger"
      />
    </ScrollView>
  );
}

function SettingsScreen({ theme, settings, onChangeSettings, onBack }) {
  // Tela de configurações. Demonstra o uso de Switch e de estado booleano.
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Configurações" theme={theme} onBack={onBack} />

      <View style={[styles.settingsItem, { backgroundColor: theme.surface }]}>
        <View style={styles.settingsText}>
          <Text style={[styles.taskTitle, { color: theme.text }]}>Modo escuro</Text>
          <Text style={[styles.smallText, { color: theme.muted }]}>
            Altera as cores principais do aplicativo.
          </Text>
        </View>
        <Switch
          value={settings.darkMode}
          onValueChange={(value) =>
            onChangeSettings((current) => ({ ...current, darkMode: value }))
          }
        />
      </View>

      <View style={[styles.settingsItem, { backgroundColor: theme.surface }]}>
        <View style={styles.settingsText}>
          <Text style={[styles.taskTitle, { color: theme.text }]}>Notificações</Text>
          <Text style={[styles.smallText, { color: theme.muted }]}>
            Preferência visual para explicar uso de estado booleano.
          </Text>
        </View>
        <Switch
          value={settings.notifications}
          onValueChange={(value) =>
            onChangeSettings((current) => ({ ...current, notifications: value }))
          }
        />
      </View>
    </ScrollView>
  );
}

function Header({ title, theme, onBack }) {
  // Cabeçalho reutilizável usado nas telas internas.
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: theme.primary }]}>Voltar</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
    </View>
  );
}

function AppButton({ title, theme, onPress, variant = "primary", compact = false }) {
  // Botão customizado com TouchableOpacity para permitir o visual do protótipo:
  // cantos arredondados, cor cheia e sombra suave. O Button nativo foi evitado
  // aqui porque ele oferece pouca personalização de estilo.
  const isDanger = variant === "danger";

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.appButton,
        compact && styles.compactButton,
        { backgroundColor: isDanger ? theme.danger : theme.primary },
      ]}
    >
      <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const lightTheme = {
  // Tema claro inspirado no PNG do Figma: fundo suave, cards brancos e azul vivo.
  background: "#f7f8fc",
  surface: "#ffffff",
  input: "#ffffff",
  text: "#20212a",
  muted: "#828693",
  border: "#e4e7ef",
  primary: "#0877f2",
  danger: "#ef4444",
};

const darkTheme = {
  // Tema escuro usado para demonstrar personalização visual pelo usuário.
  background: "#11131a",
  surface: "#1d2230",
  input: "#202638",
  text: "#f9fafb",
  muted: "#b8bfcc",
  border: "#333a49",
  primary: "#3593ff",
  danger: "#f87171",
};

const styles = StyleSheet.create({
  // StyleSheet concentra todos os estilos do aplicativo. Isso evita repetir
  // objetos de estilo grandes dentro do JSX e deixa a apresentação mais clara.
  safeArea: {
    flex: 1,
  },
  flexScreen: {
    flex: 1,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 26,
  },
  screenContent: {
    padding: 24,
  },
  loginCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#e8f1ff",
    borderRadius: 28,
    height: 118,
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#0877f2",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    width: 118,
  },
  heroImage: {
    backgroundColor: "#b7dcff",
    borderRadius: 20,
    height: 54,
    width: 54,
  },
  heroBadge: {
    alignItems: "center",
    backgroundColor: "#0877f2",
    borderRadius: 16,
    bottom: 18,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 18,
    width: 32,
  },
  heroBadgeText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  title: {
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  buttonGap: {
    marginBottom: 14,
  },
  textButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  link: {
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 28,
  },
  backButton: {
    backgroundColor: "#edf4ff",
    borderRadius: 18,
    marginRight: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  homeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  roundButton: {
    alignItems: "center",
    backgroundColor: "#e7effb",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  roundButtonText: {
    color: "#0877f2",
    fontSize: 18,
    fontWeight: "800",
    marginTop: -5,
  },
  summaryBox: {
    borderRadius: 20,
    marginBottom: 24,
    padding: 20,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
  },
  summaryNumber: {
    fontSize: 40,
    fontWeight: "800",
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800",
  },
  summaryTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressCircle: {
    alignItems: "center",
    backgroundColor: "#e8f1ff",
    borderColor: "#0877f2",
    borderRadius: 25,
    borderWidth: 5,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  progressText: {
    color: "#0877f2",
    fontSize: 16,
    fontWeight: "800",
  },
  progressTrack: {
    backgroundColor: "#e8ebf3",
    borderRadius: 999,
    height: 8,
    marginTop: 18,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#0877f2",
    borderRadius: 999,
    height: 8,
  },
  summaryFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  taskCard: {
    borderRadius: 18,
    marginBottom: 14,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
  },
  taskRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    marginRight: 8,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  doneBadge: {
    backgroundColor: "#e8f1ff",
    color: "#0877f2",
  },
  pendingBadge: {
    backgroundColor: "#f0f2f7",
    color: "#828693",
  },
  emptyText: {
    fontSize: 16,
    paddingVertical: 24,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  settingsItem: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
  },
  settingsText: {
    flex: 1,
    paddingRight: 12,
  },
  appButton: {
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
    shadowColor: "#0877f2",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  compactButton: {
    minHeight: 38,
    paddingHorizontal: 16,
  },
  appButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});
