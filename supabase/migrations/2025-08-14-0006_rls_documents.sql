-- Tighten RLS for core tables using auth.uid()
alter table documents enable row level security;
create policy if not exists documents_owner_select on documents for select using (created_by = auth.uid());
create policy if not exists documents_owner_ins on documents for insert with check (created_by = auth.uid());
create policy if not exists documents_owner_upd on documents for update using (created_by = auth.uid()) with check (created_by = auth.uid());

alter table recipients enable row level security;
create policy if not exists recipients_doc_select on recipients for select using (exists (
  select 1 from documents d where d.id = recipients.document_id and d.created_by = auth.uid()
));
create policy if not exists recipients_doc_ins on recipients for insert with check (exists (
  select 1 from documents d where d.id = recipients.document_id and d.created_by = auth.uid()
));

alter table signatures enable row level security;
create policy if not exists signatures_doc_select on signatures for select using (exists (
  select 1 from documents d where d.id = signatures.document_id and d.created_by = auth.uid()
));

alter table audit_trail enable row level security;
create policy if not exists audit_trail_doc_select on audit_trail for select using (exists (
  select 1 from documents d where d.id = audit_trail.document_id and d.created_by = auth.uid()
));

