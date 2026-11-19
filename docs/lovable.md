# Use the starter in Lovable

## 1. Get the code into Lovable

Lovable syncs a project with GitHub in both directions, so the code reaches Lovable through a GitHub repository:

1. In Lovable, create a new project. Any first prompt will do, such as "Empty project".
2. Connect it to GitHub (**Settings > GitHub**). Lovable creates a repository for the project.
3. Copy this starter's files into that repository and push them. Lovable picks up the change and shows your
   marketplace.

Or skip the code: paste the **starter prompt** from your Yclas panel (**Integrations > Your own front end**) into a
new Lovable project. You get a similar app built from scratch, following the same rules.

## 2. Settings

Open the project's environment variables, or ask Lovable to create a `.env`, and set:

- `VITE_YCLAS_URL`: your Yclas site.
- `VITE_YCLAS_SITE_KEY`: your site's API key.
- `VITE_SITE_NAME`: your marketplace's name.

## 3. Let the preview reach your site

In your Yclas panel, **Integrations > Your own front end**, add `https://*.lovable.app`. When you publish on your
own domain, add that address too, and remove the wildcard once you no longer need previews.

## 4. Keep building by prompt

Start with *"Read AGENTS.md and follow it for every change"*. The file tells Lovable to keep Yclas as the back end.
Some ideas:

- *Make the home page darker, with a big search box and the categories as photo tiles.*
- *Add a map of listings on the browse page, using each listing's latitude and longitude.*
- *Add a seller page at /seller/:id that shows their listings.*

If Lovable offers to add Supabase or its own database for listings or users, say no. They're already on your Yclas
site.
