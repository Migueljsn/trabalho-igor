-- Script da tabela usada pelo aplicativo OrganizaTarefas.
-- Execute este arquivo no SQL Editor do Supabase antes de apresentar o app.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default 'Sem descrição.',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS fica ligado para manter o padrão de segurança do Supabase.
alter table public.tasks enable row level security;

-- As políticas abaixo deixam o app acadêmico funcionar sem login real.
-- Em um app de produção, cada tarefa deveria pertencer a um usuário autenticado.
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
