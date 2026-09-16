-- ============================================================================
-- Titer Up -- Supabase schema
-- ============================================================================
-- Run this whole file once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- Design notes:
--  * Every table has Row Level Security enabled with ZERO policies for
--    anon/authenticated. That means the frontend can never select, insert, or
--    update a table directly over the API, even with the public anon key.
--  * All reads and writes go through the functions below, which run as
--    SECURITY DEFINER (elevated privilege) and contain the actual rules:
--      - correct_index is only ever returned once a question has ended
--      - only whoever holds a game's host_token can start/advance/end it
--      - a player can't submit two answers to the same question
--  * This keeps a full quiz-authoring UI out of scope while still making it
--    impossible for a curious player to see the answer key early via dev
--    tools -- the value simply isn't sent until the round is over.
-- ============================================================================

-- ---------- Tables ----------------------------------------------------------

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  order_index int not null,
  question_text text not null,
  options jsonb not null,       -- e.g. ["Option A", "Option B", "Option C", "Option D"]
  correct_index int not null,   -- 0-based index into options
  time_limit int not null default 20, -- seconds
  unique (quiz_id, order_index)
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  quiz_id uuid not null references quizzes(id),
  host_token uuid not null default gen_random_uuid(),
  status text not null default 'lobby'
    check (status in ('lobby', 'question', 'question_end', 'finished')),
  current_question_index int not null default -1,
  question_started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  nickname text not null,
  score int not null default 0,
  created_at timestamptz not null default now(),
  unique (game_id, nickname)
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  question_id uuid not null references questions(id),
  selected_index int not null,
  is_correct boolean not null,
  points_awarded int not null default 0,
  answered_at timestamptz not null default now(),
  unique (game_id, player_id, question_id)
);

-- ---------- Lock every table down completely --------------------------------
-- RLS enabled + no policies = no anon/authenticated access via the API,
-- full stop. All access happens through the SECURITY DEFINER functions below.

alter table quizzes enable row level security;
alter table questions enable row level security;
alter table games enable row level security;
alter table players enable row level security;
alter table answers enable row level security;

revoke all on quizzes, questions, games, players, answers from anon, authenticated;

-- ---------- Functions --------------------------------------------------------

create or replace function list_quizzes()
returns table (id uuid, title text, question_count bigint)
language sql security definer set search_path = public as $$
  select qz.id, qz.title, count(q.id)
  from quizzes qz
  left join questions q on q.quiz_id = qz.id
  group by qz.id, qz.title
  order by qz.title;
$$;

create or replace function create_game(p_quiz_id uuid)
returns table (id uuid, code text, host_token uuid)
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_id uuid;
  v_token uuid := gen_random_uuid();
begin
  if not exists (select 1 from quizzes where quizzes.id = p_quiz_id) then
    raise exception 'QUIZ_NOT_FOUND';
  end if;

  loop
    v_code := (
      select string_agg(substr(chars, (random() * length(chars))::int + 1, 1), '')
      from (select 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' as chars) s,
           generate_series(1, 6)
    );
    exit when not exists (select 1 from games g where g.code = v_code);
  end loop;

  insert into games (code, quiz_id, host_token, status, current_question_index)
  values (v_code, p_quiz_id, v_token, 'lobby', -1)
  returning games.id into v_id;

  return query select v_id, v_code, v_token;
end;
$$;

create or replace function join_game(p_code text, p_nickname text)
returns table (player_id uuid, game_id uuid, quiz_title text)
language plpgsql security definer set search_path = public as $$
declare
  v_game games%rowtype;
  v_player_id uuid;
  v_title text;
  v_nickname text := trim(p_nickname);
begin
  if v_nickname = '' then
    raise exception 'NICKNAME_REQUIRED';
  end if;

  select * into v_game from games where code = upper(trim(p_code));
  if not found then
    raise exception 'GAME_NOT_FOUND';
  end if;
  if v_game.status <> 'lobby' then
    raise exception 'GAME_ALREADY_STARTED';
  end if;

  select title into v_title from quizzes where quizzes.id = v_game.quiz_id;

  begin
    insert into players (game_id, nickname) values (v_game.id, v_nickname)
    returning players.id into v_player_id;
  exception when unique_violation then
    raise exception 'NICKNAME_TAKEN';
  end;

  return query select v_player_id, v_game.id, v_title;
end;
$$;

create or replace function get_game_state(p_code text)
returns table (
  game_id uuid,
  status text,
  current_question_index int,
  total_questions bigint,
  question_started_at timestamptz,
  quiz_title text,
  question_id uuid,
  question_text text,
  options jsonb,
  time_limit int,
  correct_index int
)
language sql security definer set search_path = public as $$
  select
    g.id,
    g.status,
    g.current_question_index,
    (select count(*) from questions where questions.quiz_id = g.quiz_id),
    g.question_started_at,
    qz.title,
    q.id,
    q.question_text,
    q.options,
    q.time_limit,
    case when g.status in ('question_end', 'finished') then q.correct_index else null end
  from games g
  join quizzes qz on qz.id = g.quiz_id
  left join questions q
    on q.quiz_id = g.quiz_id and q.order_index = g.current_question_index
  where g.code = upper(trim(p_code));
$$;

create or replace function get_players(p_game_id uuid)
returns table (id uuid, nickname text, score int)
language sql security definer set search_path = public as $$
  select players.id, players.nickname, players.score
  from players
  where players.game_id = p_game_id
  order by players.score desc, players.nickname asc;
$$;

create or replace function start_game(p_game_id uuid, p_host_token uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update games
  set status = 'question', current_question_index = 0, question_started_at = now()
  where games.id = p_game_id and games.host_token = p_host_token and games.status = 'lobby';

  if not found then
    raise exception 'UNAUTHORIZED_OR_INVALID_STATE';
  end if;
end;
$$;

create or replace function end_question(p_game_id uuid, p_host_token uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update games
  set status = 'question_end'
  where games.id = p_game_id and games.host_token = p_host_token and games.status = 'question';

  if not found then
    raise exception 'UNAUTHORIZED_OR_INVALID_STATE';
  end if;
end;
$$;

create or replace function next_question(p_game_id uuid, p_host_token uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_game games%rowtype;
  v_total int;
begin
  select * into v_game from games
  where games.id = p_game_id and games.host_token = p_host_token;

  if not found then
    raise exception 'UNAUTHORIZED';
  end if;

  select count(*) into v_total from questions where questions.quiz_id = v_game.quiz_id;

  if v_game.current_question_index + 1 < v_total then
    update games
    set current_question_index = current_question_index + 1,
        status = 'question',
        question_started_at = now()
    where games.id = p_game_id;
  else
    update games set status = 'finished' where games.id = p_game_id;
  end if;
end;
$$;

create or replace function submit_answer(
  p_game_id uuid,
  p_player_id uuid,
  p_question_id uuid,
  p_selected_index int
)
returns table (is_correct boolean, points_awarded int, new_score int)
language plpgsql security definer set search_path = public as $$
declare
  v_game games%rowtype;
  v_question questions%rowtype;
  v_existing answers%rowtype;
  v_elapsed numeric;
  v_is_correct boolean;
  v_points int;
begin
  select * into v_game from games where games.id = p_game_id;
  if not found then raise exception 'GAME_NOT_FOUND'; end if;
  if v_game.status <> 'question' then raise exception 'QUESTION_NOT_ACTIVE'; end if;

  select * into v_question from questions
  where questions.id = p_question_id and questions.quiz_id = v_game.quiz_id;
  if not found then raise exception 'QUESTION_NOT_FOUND'; end if;
  if v_question.order_index <> v_game.current_question_index then
    raise exception 'QUESTION_MISMATCH';
  end if;

  if not exists (select 1 from players where players.id = p_player_id and players.game_id = p_game_id) then
    raise exception 'PLAYER_NOT_IN_GAME';
  end if;

  select * into v_existing from answers
  where answers.game_id = p_game_id and answers.player_id = p_player_id and answers.question_id = p_question_id;

  if found then
    return query select v_existing.is_correct, v_existing.points_awarded,
      (select players.score from players where players.id = p_player_id);
    return;
  end if;

  v_elapsed := greatest(0, extract(epoch from (now() - v_game.question_started_at)));
  v_elapsed := least(v_elapsed, v_question.time_limit);

  if p_selected_index = v_question.correct_index then
    v_is_correct := true;
    v_points := round(500 + 500 * (1 - v_elapsed / greatest(v_question.time_limit, 1)));
  else
    v_is_correct := false;
    v_points := 0;
  end if;

  insert into answers (game_id, player_id, question_id, selected_index, is_correct, points_awarded)
  values (p_game_id, p_player_id, p_question_id, p_selected_index, v_is_correct, v_points);

  update players set score = score + v_points where players.id = p_player_id;

  return query select v_is_correct, v_points,
    (select players.score from players where players.id = p_player_id);
end;
$$;

create or replace function reveal_answer_counts(p_game_id uuid, p_question_id uuid)
returns table (option_index int, count bigint)
language sql security definer set search_path = public as $$
  select o.idx, count(a.id)
  from generate_series(
    0,
    (select jsonb_array_length(options) - 1 from questions where questions.id = p_question_id)
  ) as o(idx)
  left join answers a
    on a.question_id = p_question_id and a.game_id = p_game_id and a.selected_index = o.idx
  group by o.idx
  order by o.idx;
$$;

-- ---------- Let the app call these functions ---------------------------------

grant execute on function
  list_quizzes(),
  create_game(uuid),
  join_game(text, text),
  get_game_state(text),
  get_players(uuid),
  start_game(uuid, uuid),
  end_question(uuid, uuid),
  next_question(uuid, uuid),
  submit_answer(uuid, uuid, uuid, int),
  reveal_answer_counts(uuid, uuid)
to anon, authenticated;

-- ============================================================================
-- Seed data -- two ready-to-play decks so you have something to test with
-- ============================================================================

do $$
declare
  v_hema uuid;
  v_micro uuid;
begin
  insert into quizzes (title) values ('Hematology Basics') returning id into v_hema;
  insert into questions (quiz_id, order_index, question_text, options, correct_index, time_limit) values
    (v_hema, 0, 'Which blood cell type is primarily responsible for oxygen transport?',
      '["Erythrocytes", "Leukocytes", "Platelets", "Plasma cells"]', 0, 20),
    (v_hema, 1, 'Which anticoagulant is used in lavender-top tubes for a CBC?',
      '["Sodium citrate", "Heparin", "EDTA", "SPS"]', 2, 20),
    (v_hema, 2, 'Platelets are also known as:',
      '["Thrombocytes", "Leukocytes", "Reticulocytes", "Basophils"]', 0, 15),
    (v_hema, 3, 'Which test is commonly used to monitor warfarin therapy?',
      '["PTT", "PT/INR", "CBC", "ESR"]', 1, 20),
    (v_hema, 4, 'Roughly what is the normal adult male hemoglobin range?',
      '["8-10 g/dL", "13.5-17.5 g/dL", "20-24 g/dL", "5-7 g/dL"]', 1, 20);

  insert into quizzes (title) values ('Microbiology Fundamentals') returning id into v_micro;
  insert into questions (quiz_id, order_index, question_text, options, correct_index, time_limit) values
    (v_micro, 0, 'Gram-positive bacteria stain which color after Gram staining?',
      '["Pink/red", "Purple/violet", "Yellow", "Green"]', 1, 20),
    (v_micro, 1, 'Which medium differentiates enteric gram-negative bacteria by lactose fermentation?',
      '["Blood agar", "MacConkey agar", "Chocolate agar", "Sabouraud agar"]', 1, 20),
    (v_micro, 2, 'The oxidase test mainly helps differentiate:',
      '["Gram-positive vs gram-negative", "Enterobacteriaceae vs non-fermenters", "Fungi vs bacteria", "Viruses vs bacteria"]', 1, 25),
    (v_micro, 3, 'Under the microscope, Staphylococcus typically appears as:',
      '["Bacilli (rods)", "Cocci in clusters", "Cocci in chains", "Spirilla"]', 1, 15),
    (v_micro, 4, 'Which stain detects acid-fast organisms like Mycobacterium tuberculosis?',
      '["Gram stain", "Ziehl-Neelsen stain", "Giemsa stain", "India ink"]', 1, 20);
end $$;
