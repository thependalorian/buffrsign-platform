# Storage Setup (Supabase)

1. Create a bucket `documents` (public: false)
2. Add a policy to allow authenticated users to upload and read their files
3. In the app, store the file path returned by Supabase Storage in `documents.file_path`

Example (client):
```ts
const { data, error } = await supabase.storage.from('documents').upload(`docs/${docId}.pdf`, file, { upsert: true });
```
