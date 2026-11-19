# Use your Yclas site from Base44

Base44 builds apps on its own built-in back end and doesn't open outside code like this starter. You can still use
your Yclas site as the marketplace back end:

1. In your Yclas panel, open **Integrations > Your own front end**. Add your Base44 app's address, and copy the
   **starter prompt**.
2. Paste the prompt into Base44 and add: *"Use the Yclas API for all listings, users, messages and payments. Don't
   create entities for them in the Base44 database."*
3. Base44 calls the API from your app's pages, or from backend functions you ask it to write. The rules in the prompt
   still apply:
   - Public listings need no key.
   - Sign-in uses the site key.
   - Signed-in calls send the user's token.
   - Buyers pay on your Yclas site.

Give Base44 your site's guide for AI tools too: `https://<your site>/api/llms.txt`.
