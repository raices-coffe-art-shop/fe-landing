# Sanity Revalidation Webhook

Configure this webhook in Sanity Manage for the production dataset.

- Method: `POST`
- URL: `https://DOMINIO/api/revalidate`
- Filter: `_type == "siteSettings"`
- Secret: same value as `SANITY_REVALIDATE_SECRET` in hosting
- Trigger on: create, update, delete
- Drafts and versions: off

The endpoint validates the Sanity signature with `parseBody` from `next-sanity/webhook`.
When the published `siteSettings` document changes, it invalidates the `siteSettings` cache tag
and the public routes that render the shared logo or social links.

For local testing, expose `http://localhost:3000/api/revalidate` through a secure tunnel and use
that tunnel URL in Sanity Manage.
