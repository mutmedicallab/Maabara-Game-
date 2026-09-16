# Titer Up

A live, Kahoot-style quiz for the lab. One host screen, one join code, everyone
answers from their own phone. Built with React + Vite + Tailwind CSS v4 and a
Supabase Postgres backend.

Comes with two ready-made decks: **Hematology Basics** and **Microbiology
Fundamentals**, five questions each.

---

## 1. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com), sign up, and create a new project.
   Pick any name/region/password (the password is just for direct DB access,
   the app doesn't need it).
2. Wait for the project to finish provisioning (~2 minutes).
3. In the left sidebar go to **SQL Editor** → **New query**.
4. Open `supabase/schema.sql` from this project, copy the whole file, paste it
   in, and click **Run**.
   - This creates all 5 tables, locks them down with Row Level Security, adds
     the functions the app calls, and seeds the two sample quizzes.
   - It's safe to re-run in a fresh project. If you run it twice in the same
     project you'll get duplicate quizzes — just delete the extras from the
     **Table Editor** if that happens.
5. Go to **Settings → API**. You'll need two values from this page in a
   moment: **Project URL** and the **anon / public** key.

## 2. Run it locally

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in the two values from Supabase:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Then:

```bash
npm run dev
```

Open the printed local URL. Go to **Host a game** on one browser tab/device,
**Join a game** on another (or your phone), and play through a round.

## 3. Deploy to Vercel (free)

1. Push this project to a GitHub repo.
2. In Vercel, **Add New Project** → import that repo.
3. Vercel will auto-detect Vite. Framework preset: **Vite**, build command
   `npm run build`, output directory `dist` (these are the defaults, you
   shouldn't need to change anything).
4. Before deploying, add the two environment variables under **Settings →
   Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Share the resulting `*.vercel.app` link with your club for the
   "Join a game" screen, and use it yourself for "Host a game."

That's it — no server to run, no separate backend to deploy. The frontend
talks to Supabase directly.

### Note on Supabase's free tier

A free Supabase project **pauses automatically after about a week of
inactivity**. Since this is for occasional quiz nights, just open your
Supabase dashboard a day before your next session — un-pausing takes seconds
and it stays awake as long as it's being used.

## 4. Adding your own quizzes

There's no quiz-builder UI (kept out of scope to keep this a fast build) —
add decks directly in Supabase's **Table Editor** or **SQL Editor**:

```sql
do $$
declare v_quiz uuid;
begin
  insert into quizzes (title) values ('Your Quiz Title') returning id into v_quiz;
  insert into questions (quiz_id, order_index, question_text, options, correct_index, time_limit) values
    (v_quiz, 0, 'Your question?', '["Option A", "Option B", "Option C", "Option D"]', 0, 20),
    (v_quiz, 1, 'Second question?', '["A", "B", "C", "D"]', 2, 20);
end $$;
```

- `order_index` starts at `0` and must be sequential with no gaps.
- `correct_index` is the 0-based position in the `options` array.
- `time_limit` is in seconds.

## How it works

- **No Realtime channels, just polling.** Both the host screen and every
  player's phone poll a single database function (`get_game_state`) about
  once a second. This keeps the whole sync model in one place instead of
  spread across websocket event handlers, at the cost of ~1s of latency —
  unnoticeable for a room-scale quiz.
- **The frontend never touches tables directly.** Every table has Row Level
  Security turned on with *no* policies, which blocks all direct API access.
  The app only calls a fixed set of Postgres functions (see
  `supabase/schema.sql`), each of which enforces its own rules — e.g.
  `submit_answer` checks the question is still live and computes
  correctness/points itself, so a player can't fake a score by editing
  requests in dev tools.
- **The answer key is never shipped early.** `get_game_state` only includes
  `correct_index` once a question's status is `question_end` or `finished`.
  While a question is live, everyone (host included) gets the same
  functions returning `null` for it.
- **Host controls are gated by a token, not a login.** Creating a game
  returns a `host_token` that's stored in the host's browser
  (`sessionStorage`) and required by every start/advance/end call. There's
  no real authentication system behind this — it's a deliberate trade-off
  to keep the project simple for a casual, trusted-group setting. Don't
  reuse this pattern for anything where a stranger having write access would
  actually matter.

## Known limitations

- One question type only: multiple choice, up to 6 options.
- No quiz-builder UI — quizzes are added via SQL/Table Editor.
- No reconnection handling beyond `sessionStorage` — clearing site data or
  switching browsers mid-game means rejoining as a new player.
- Scoring is a simple speed-weighted formula (500–1000 points for a correct
  answer depending on how fast it was submitted, 0 for wrong) — not
  configurable per question.
