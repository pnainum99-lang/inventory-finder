# Inventory Finder Pro v3

This version adds a real online search backend, Supabase database, authentication, search history, saved listings, inventory management, seller/source fields, dashboard and delete controls.

## Important: external search
The app uses Tavily Search as the web-search backend. Tavily supports current search, date filtering, domain filtering and returns title/URL/content for results. The app requests the last 60 days. It does **not** bypass marketplace logins, CAPTCHAs, robots rules or private data. OLX/Facebook and other sites may not expose every listing publicly to search engines.

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase.sql`.
3. Enable Email/Password authentication in Supabase Auth.
4. Create a Tavily API key.
5. In Vercel Project Settings > Environment Variables add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `TAVILY_API_KEY`
6. Redeploy.

Never put a Supabase service-role key in Vercel frontend variables. The browser should use only the publishable key.
