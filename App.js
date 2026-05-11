import React, { useMemo, useState } from "react";
import {
  Alert,
  Button,
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

// Este projeto foi escrito em um único arquivo para facilitar o estudo.
// Em um projeto maior, cada tela poderia ficar em uma pasta como src/screens.

// Imagem em formato PNG base64 para cumprir o requisito do componente Image
// sem depender de arquivo externo ou internet. Ela aparece como um bloco verde
// no topo da tela de login.
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

// Função simples para gerar ids sem banco de dados.
// Para o ponto extra, o README explica como substituir esta parte por Firebase.
function createId() {
  return String(Date.now());
}

export default function App() {
  // screen controla qual tela aparece. Isso simula a navegação entre telas
  // de forma bem simples para fins acadêmicos.
  const [screen, setScreen] = useState("login");

  // user guarda os dados básicos do usuário logado.
  const [user, setUser] = useState(null);

  // tasks é o "estado global" da lista de tarefas do app.
  const [tasks, setTasks] = useState(INITIAL_TASKS);

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

  function handleLogin(email) {
    // Validação simples apenas para demonstrar regra de formulário.
    if (!email.includes("@")) {
      Alert.alert("Atenção", "Digite um e-mail válido para entrar.");
      return;
    }

    setUser({ name: "Estudante", email });
    setScreen("home");
  }

  function handleRegister(name, email) {
    if (!name.trim() || !email.includes("@")) {
      Alert.alert("Atenção", "Preencha nome e e-mail corretamente.");
      return;
    }

    setUser({ name: name.trim(), email });
    setScreen("home");
  }

  function handleAddTask(title, description) {
    if (!title.trim()) {
      Alert.alert("Atenção", "O título da tarefa é obrigatório.");
      return;
    }

    const newTask = {
      id: createId(),
      title: title.trim(),
      description: description.trim() || "Sem descrição.",
      done: false,
    };

    // O spread operator cria uma nova lista, mantendo o estado imutável.
    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setScreen("home");
  }

  function handleUpdateTask(updatedTask) {
    // map percorre as tarefas e troca apenas a tarefa editada.
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );

    setScreen("home");
  }

  function handleDeleteTask(taskId) {
    // filter remove a tarefa cujo id é igual ao selecionado.
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    setSelectedTaskId(null);
    setScreen("home");
  }

  function handleLogout() {
    setUser(null);
    setSelectedTaskId(null);
    setScreen("login");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.darkMode ? "light-content" : "dark-content"} />

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
  // Cada TextInput precisa de um state para armazenar o que o usuário digitou.
  const [email, setEmail] = useState("aluno@faculdade.com");

  return (
    <ScrollView contentContainerStyle={styles.centeredContent}>
      <Image source={{ uri: APP_IMAGE }} style={styles.heroImage} resizeMode="contain" />

      <Text style={[styles.title, { color: theme.text }]}>OrganizaTarefas</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Organize atividades, acompanhe pendências e prepare sua rotina de estudo.
      </Text>

      <Text style={[styles.label, { color: theme.text }]}>E-mail</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Digite seu e-mail"
        placeholderTextColor={theme.muted}
      />

      <View style={styles.buttonGap}>
        <Button title="Entrar" color={theme.primary} onPress={() => onLogin(email)} />
      </View>

      <TouchableOpacity onPress={onGoToRegister} style={styles.textButton}>
        <Text style={[styles.link, { color: theme.primary }]}>Criar nova conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function RegisterScreen({ theme, onRegister, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Cadastro" theme={theme} onBack={onBack} />

      <Text style={[styles.label, { color: theme.text }]}>Nome</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        value={name}
        onChangeText={setName}
        placeholder="Seu nome"
        placeholderTextColor={theme.muted}
      />

      <Text style={[styles.label, { color: theme.text }]}>E-mail</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="seu@email.com"
        placeholderTextColor={theme.muted}
      />

      <Button
        title="Cadastrar e entrar"
        color={theme.primary}
        onPress={() => onRegister(name, email)}
      />
    </ScrollView>
  );
}

function HomeScreen({ theme, user, tasks, onAdd, onOpenTask, onSettings, onLogout }) {
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
            <Text style={styles.roundButtonText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{tasks.length}</Text>
          <Text style={[styles.summaryText, { color: theme.text }]}>tarefas no total</Text>
          <Text style={[styles.smallText, { color: theme.muted }]}>
            {finishedCount} concluídas • {pendingCount} pendentes
          </Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Minhas tarefas</Text>
          <Button title="Adicionar" color={theme.primary} onPress={onAdd} />
        </View>
      </View>

      <FlatList
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
                {item.done ? "Concluída" : "Pendente"}
              </Text>
            </View>

            <Text style={[styles.taskDescription, { color: theme.muted }]}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Button title="Sair" color={theme.danger} onPress={onLogout} />
      </View>
    </View>
  );
}

function AddTaskScreen({ theme, onSave, onBack }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Adicionar tarefa" theme={theme} onBack={onBack} />

      <Text style={[styles.label, { color: theme.text }]}>Título</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
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
          { borderColor: theme.border, color: theme.text },
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Detalhe o que precisa ser feito"
        placeholderTextColor={theme.muted}
        multiline
      />

      <Button
        title="Salvar tarefa"
        color={theme.primary}
        onPress={() => onSave(title, description)}
      />
    </ScrollView>
  );
}

function TaskDetailsScreen({ theme, task, onSave, onDelete, onBack }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [done, setDone] = useState(task.done);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Detalhes" theme={theme} onBack={onBack} />

      <Text style={[styles.label, { color: theme.text }]}>Título</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { color: theme.text }]}>Descrição</Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          { borderColor: theme.border, color: theme.text },
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
        <Button
          title="Salvar alterações"
          color={theme.primary}
          onPress={() => onSave({ ...task, title, description, done })}
        />
      </View>

      <Button title="Excluir tarefa" color={theme.danger} onPress={() => onDelete(task.id)} />
    </ScrollView>
  );
}

function SettingsScreen({ theme, settings, onChangeSettings, onBack }) {
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
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: theme.primary }]}>Voltar</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
    </View>
  );
}

const lightTheme = {
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#cbd5e1",
  primary: "#0f766e",
  danger: "#b91c1c",
};

const darkTheme = {
  background: "#111827",
  surface: "#1f2937",
  text: "#f9fafb",
  muted: "#cbd5e1",
  border: "#475569",
  primary: "#14b8a6",
  danger: "#f87171",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flexScreen: {
    flex: 1,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  screenContent: {
    padding: 24,
  },
  heroImage: {
    width: "100%",
    height: 160,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  buttonGap: {
    marginBottom: 12,
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
    marginBottom: 24,
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  homeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  roundButton: {
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  roundButtonText: {
    fontSize: 22,
  },
  summaryBox: {
    borderRadius: 8,
    marginBottom: 22,
    padding: 18,
  },
  summaryNumber: {
    fontSize: 34,
    fontWeight: "800",
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  smallText: {
    fontSize: 14,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  taskCard: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
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
    fontWeight: "700",
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
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
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
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 16,
  },
  settingsText: {
    flex: 1,
    paddingRight: 12,
  },
});
