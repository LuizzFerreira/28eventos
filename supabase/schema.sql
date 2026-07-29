-- =============================================
-- LG Eventos - Supabase Schema
-- =============================================

create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  nome text,
  avatar_url text,
  telefone text,
  cidade text,
  estado text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nome, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CATEGORIES
create table public.categorias (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  descricao text,
  icone text,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- categorias: sem RLS, leitura pública

-- PRODUCTS
create table public.produtos (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  descricao text,
  preco decimal(10,2) not null default 0,
  categoria_id uuid references public.categorias(id),
  ativo boolean default true,
  destaque boolean default false,
  created_at timestamptz default now()
);

-- produtos: sem RLS, leitura pública

-- PRODUCT IMAGES
create table public.imagens (
  id uuid default uuid_generate_v4() primary key,
  produto_id uuid references public.produtos(id) on delete cascade,
  url text not null,
  ordem int default 0,
  created_at timestamptz default now()
);

-- imagens: sem RLS, leitura pública

-- EVENTS
create table public.eventos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nome_evento text not null,
  tipo_evento text not null,
  data date,
  horario_inicio time,
  horario_fim time,
  endereco text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  quantidade_pessoas int default 0,
  possui_aniversariante boolean default false,
  nome_aniversariante text,
  idade_aniversariante int,
  sexo_aniversariante text,
  observacoes text,
  valor_total decimal(10,2) default 0,
  status text default 'em_criacao' check (status in ('em_criacao','orcamento','em_analise','confirmado','finalizado','cancelado')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.eventos enable row level security;
create policy "Users can view own events" on public.eventos for select using (auth.uid() = user_id);
create policy "Users can create own events" on public.eventos for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on public.eventos for update using (auth.uid() = user_id);
create policy "Admins can manage all events" on public.eventos for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- EVENT ITEMS
create table public.evento_itens (
  id uuid default uuid_generate_v4() primary key,
  evento_id uuid references public.eventos(id) on delete cascade not null,
  produto_id uuid references public.produtos(id) not null,
  quantidade int not null default 1,
  valor_unitario decimal(10,2) not null,
  subtotal decimal(10,2) not null,
  created_at timestamptz default now()
);

alter table public.evento_itens enable row level security;
create policy "Users can manage own event items" on public.evento_itens for all using (
  exists (select 1 from public.eventos where id = evento_id and user_id = auth.uid())
);
create policy "Admins can manage all event items" on public.evento_itens for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- MESSAGES
create table public.mensagens (
  id uuid default uuid_generate_v4() primary key,
  evento_id uuid references public.eventos(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  conteudo text not null,
  lida boolean default false,
  created_at timestamptz default now()
);

alter table public.mensagens enable row level security;
create policy "Users can view messages of own events" on public.mensagens for select using (
  exists (select 1 from public.eventos where id = evento_id and user_id = auth.uid())
  or auth.uid() = user_id
);
create policy "Users can send messages" on public.mensagens for insert with check (auth.uid() = user_id);
create policy "Admins can manage all messages" on public.mensagens for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- NOTIFICATIONS
create table public.notificacoes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  titulo text not null,
  mensagem text not null,
  lida boolean default false,
  tipo text default 'info' check (tipo in ('info','success','warning','error')),
  created_at timestamptz default now()
);

alter table public.notificacoes enable row level security;
create policy "Users can view own notifications" on public.notificacoes for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notificacoes for update using (auth.uid() = user_id);
create policy "Admins can manage notifications" on public.notificacoes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- GUESTS RSVP
create table public.convidados (
  id uuid default uuid_generate_v4() primary key,
  evento_id uuid references public.eventos(id) on delete cascade not null,
  nome text not null,
  email text,
  telefone text,
  confirmado boolean default false,
  created_at timestamptz default now()
);

alter table public.convidados enable row level security;
create policy "Users can manage guests of own events" on public.convidados for all using (
  exists (select 1 from public.eventos where id = evento_id and user_id = auth.uid())
);

-- CHECKLIST
create table public.checklist (
  id uuid default uuid_generate_v4() primary key,
  evento_id uuid references public.eventos(id) on delete cascade not null,
  titulo text not null,
  concluido boolean default false,
  ordem int default 0,
  created_at timestamptz default now()
);

alter table public.checklist enable row level security;
create policy "Users can manage own checklist" on public.checklist for all using (
  exists (select 1 from public.eventos where id = evento_id and user_id = auth.uid())
);

-- SERVICE PREFERENCES
create table public.evento_item_preferencias (
  id uuid default uuid_generate_v4() primary key,
  evento_item_id uuid references public.evento_itens(id) on delete cascade not null unique,
  respostas jsonb not null default '{}',
  updated_at timestamptz default now()
);

alter table public.evento_item_preferencias enable row level security;
create policy "Users can manage own preferences" on public.evento_item_preferencias for all using (
  exists (
    select 1 from public.evento_itens ei
    join public.eventos e on e.id = ei.evento_id
    where ei.id = evento_item_id and e.user_id = auth.uid()
  )
);
create policy "Admins can view all preferences" on public.evento_item_preferencias for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- FAVORITES
create table public.favoritos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  produto_id uuid references public.produtos(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, produto_id)
);

alter table public.favoritos enable row level security;
create policy "Users can manage own favorites" on public.favoritos for all using (auth.uid() = user_id);

-- SEED: Categories
insert into public.categorias (nome, icone) values
  ('DJ', 'music'), ('Bartender', 'wine'), ('Fotografia', 'camera'),
  ('Filmagem', 'video'), ('Cabine de Fotos', 'aperture'), ('Foto 360°', 'rotate-cw'),
  ('Robô de LED', 'cpu'), ('Painel de LED', 'monitor'), ('Som', 'speaker'),
  ('Iluminação', 'zap'), ('Moving Heads', 'sun'), ('Máquina de Fumaça', 'cloud'),
  ('Sky Paper', 'wind'), ('Canhão de Luz', 'flashlight'), ('Palco', 'layout'),
  ('Pista de LED', 'grid'), ('Decoração', 'flower'), ('Cerimonial', 'award'),
  ('Recepcionistas', 'users'), ('Seguranças', 'shield'), ('Garçons', 'coffee'),
  ('Buffet', 'utensils'), ('Bolo', 'cake'), ('Doces', 'candy'),
  ('Open Bar', 'glass-water'), ('Brinquedos', 'gamepad'), ('Personagens', 'smile'),
  ('Brinquedos Infláveis', 'circle'), ('Drone', 'navigation'), ('Transmissão ao Vivo', 'radio'),
  ('Lembrancinhas', 'gift'), ('Convites Digitais', 'mail'), ('Site do Evento', 'globe'),
  ('Confirmação Online', 'check-circle'), ('Pulseiras', 'link'),
  ('Totem de Autoatendimento', 'tablet'), ('Gerador', 'battery'),
  ('Tenda', 'home'), ('Climatização', 'thermometer');
