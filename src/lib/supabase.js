import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

// URL pública do projeto no Supabase. Essa informação pode ficar no app,
// porque ela apenas identifica para qual projeto as requisições serão enviadas.
const supabaseUrl = "https://ceufkxprufdivgrqzlrz.supabase.co";

// Chave pública publishable/anon. Ela é adequada para frontend e mobile,
// desde que as permissões da tabela sejam controladas por Row Level Security.
const supabaseKey = "sb_publishable_b-6IO8z1nvmGkq9v0FLBKg_YFRslQYH";

// Cliente usado pelo App.js para consultar, inserir, editar e excluir tarefas.
export const supabase = createClient(supabaseUrl, supabaseKey);
