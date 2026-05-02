# Admin Panel — Auth Gate + Domain Model Patch

This patch fixes the rubric's biggest issues:

- **Auth gate (was 0/10):** middleware + admin layout + tightened OAuth callback
  block all admin routes unless `profiles.is_superadmin = true`.
- **Domain model (Assignment 7):** new `/domain-model` page with an ERD
  rendered by Mermaid plus prose descriptions of every entity and flow.
- **Removes the -100 risk** flagged in "Authentication wall is missing or broken"
  and "Admin panel is publicly accessible without authentication."

## What you'll do

1. Make sure your own profile has `is_superadmin = true` in Supabase
   (otherwise the new gate locks YOU out — see step 0 below).
2. Drop the patch files into your existing repo.
3. Install the one new dep (`mermaid`).
4. Commit, push, redeploy.

---

## Step 0 — Unlock yourself before deploying

Run this in **Supabase Studio → SQL Editor**, replacing the email with the
Google account you'll sign in with:

```sql
update public.profiles
set is_superadmin = true
where id = (
  select id from auth.users where email = 'jll2257@columbia.edu'
);
```

If the update affected 0 rows, your profile row doesn't exist yet. In that
case, sign in with Google to your own admin app once (current open version
or via the new login flow), let the row get created, then run the SQL.

---

## Step 1 — Drop these files into your repo

From the patch zip, copy these into the matching paths in your local
`Humor-admin-panel` clone (overwrite anything that exists):

```
middleware.ts                                 →  middleware.ts            (NEW)
app/admin/layout.tsx                          →  app/admin/layout.tsx     (NEW)
app/auth/callback/route.ts                    →  overwrite existing
app/unauthorized/page.tsx                     →  app/unauthorized/page.tsx (NEW)
app/domain-model/page.tsx                     →  app/domain-model/page.tsx (NEW)
app/domain-model/DomainModelDiagram.tsx       →  app/domain-model/DomainModelDiagram.tsx (NEW)
```

## Step 2 — Install Mermaid

```bash
npm install mermaid
```

## Step 3 — Add a link to the domain model from the admin home

(Optional but recommended for visible credit.) In `app/admin/page.tsx`, find
the `SECTIONS` array and add this entry near the top:

```ts
{ label: "Domain Model", href: "/domain-model", icon: "🗺", desc: "ERD + entity docs" },
```

## Step 4 — Commit and push

```bash
git checkout -b admin-auth-gate
git add -A
git commit -m "Add strict superadmin gate + domain-model ERD page"
git push -u origin admin-auth-gate
```

Then merge `admin-auth-gate` → `main` on GitHub.

## Step 5 — Verify

After Vercel redeploys:

1. **Open the deployed URL in Incognito.** You should be redirected to
   `/login` (not see the admin home). This is the auth wall working.
2. Sign in with your Google account. You should land on `/admin`.
3. Visit `/domain-model`. You should see the ERD and entity docs.
4. Sign out, then try the deployed URL `/admin/images` directly in
   Incognito. You should bounce back to `/login` again.

If a non-superadmin Google account signs in, they should see the
`/unauthorized` page, not the admin home.

## What this DOES NOT fix

- Image description edit not persisting (5/10 → 10/10): needs an audit of
  `components/CrudTable.tsx` and the images page mutation flow. Skipped
  for time.
- Infinite-scroll bug → page-based pagination (2.5/5 → 5/5): also skipped.
- UI polish across all admin pages (multiple 5/10 and 2.5/5 callouts).

These can come in a follow-up patch if there's time after submission.
