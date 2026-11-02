import type { SupabaseClient } from '@supabase/supabase-js';
import { PAGE_SIZE, safeSearch, type CustomerDetail, type CustomerRow, type EnquiryDetail, type EnquiryQuery, type EnquiryRow, type EnquiryStatus, type StaffOption } from '../../domain';
import { RepositoryError, type CustomerInput, type InboxRepository } from '../../application';

type Failure = { code?: string; message: string } | null;

function fail(error: Failure): never {
  if (error?.code === '42501') throw new RepositoryError('forbidden', error.message);
  throw new RepositoryError('unavailable', error?.message ?? 'unknown');
}

interface EnquiryDb {
  id: string; name: string; phone: string | null; email: string | null; status: EnquiryStatus; source: EnquiryRow['source']; assigned_to: string | null; created_at: string;
  area?: string | null; message?: string | null; source_page?: string | null; customer_id?: string | null; puppy_id?: string | null;
  puppies?: { name: string | null; breed: string } | null;
}
interface CustomerDb {
  id: string; full_name: string; phone_e164: string | null; email: string | null; area: string | null; created_at: string;
  notes?: string | null; tags?: string[]; whatsapp_opt_in_at?: string | null; whatsapp_opted_out_at?: string | null;
}

const ENQUIRY_LIST = 'id, name, phone, email, status, source, assigned_to, created_at, puppies(name, breed)';
const toRow = (e: EnquiryDb): EnquiryRow => ({
  id: e.id, name: e.name, phone: e.phone, email: e.email, status: e.status, source: e.source, assignedTo: e.assigned_to, createdAt: e.created_at,
  puppyLabel: e.puppies ? (e.puppies.name ? `${e.puppies.name} (${e.puppies.breed})` : e.puppies.breed) : null,
});
const toCustomerRow = (c: CustomerDb): CustomerRow => ({ id: c.id, fullName: c.full_name, phone: c.phone_e164, email: c.email, area: c.area, createdAt: c.created_at });
const range = (page: number): [number, number] => [(page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1];

export class SupabaseInboxRepository implements InboxRepository {
  constructor(private readonly client: SupabaseClient) {}

  /** Update that must affect a row: RLS hides rows silently, so zero rows means refused or gone. */
  private async touched(query: PromiseLike<{ data: unknown[] | null; error: Failure }>) {
    const { data, error } = await query;
    if (error) fail(error);
    if (!data?.length) throw new RepositoryError('forbidden', 'no row changed');
  }

  async listEnquiries(q: EnquiryQuery) {
    let query = this.client.from('enquiries').select(ENQUIRY_LIST, { count: 'exact' });
    if (q.status) query = query.eq('status', q.status);
    if (q.assignedTo) query = query.eq('assigned_to', q.assignedTo);
    if (q.open) query = query.in('status', ['new', 'contacted', 'qualified']);
    const size = Math.min(q.pageSize ?? PAGE_SIZE, 200);
    const search = q.search ? safeSearch(q.search) : '';
    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range((q.page - 1) * size, q.page * size - 1);
    if (error) fail(error);
    return { rows: (data as unknown as EnquiryDb[]).map(toRow), total: count ?? 0 };
  }

  async getEnquiry(id: string): Promise<EnquiryDetail | null> {
    const { data, error } = await this.client.from('enquiries').select(`${ENQUIRY_LIST}, area, message, source_page, customer_id, puppy_id, enquiry_notes(id, body, created_at, author_id)`).eq('id', id).maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const e = data as unknown as EnquiryDb & { enquiry_notes: { id: string; body: string; created_at: string; author_id: string }[] };
    const staff = new Map((await this.listStaff()).map((s) => [s.userId, s.fullName]));
    return {
      ...toRow(e), area: e.area ?? null, message: e.message ?? null, sourcePage: e.source_page ?? null, customerId: e.customer_id ?? null, puppyId: e.puppy_id ?? null,
      notes: [...e.enquiry_notes].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((n) => ({ id: n.id, body: n.body, createdAt: n.created_at, authorName: staff.get(n.author_id) ?? 'Former staff member' })),
    };
  }

  setStatus(id: string, status: EnquiryStatus) {
    const closed_at = status === 'closed' || status === 'spam' ? new Date().toISOString() : null;
    return this.touched(this.client.from('enquiries').update({ status, closed_at }).eq('id', id).select('id'));
  }

  assign(id: string, userId: string | null) {
    return this.touched(this.client.from('enquiries').update({ assigned_to: userId }).eq('id', id).select('id'));
  }

  async addNote(enquiryId: string, body: string) {
    const { data: auth } = await this.client.auth.getUser();
    if (!auth.user) throw new RepositoryError('forbidden', 'no session');
    const { error } = await this.client.from('enquiry_notes').insert({ enquiry_id: enquiryId, author_id: auth.user.id, body });
    if (error) fail(error);
  }

  async listStaff(): Promise<StaffOption[]> {
    const { data, error } = await this.client.rpc('list_staff');
    if (error) fail(error);
    return ((data ?? []) as { user_id: string; full_name: string; role: StaffOption['role'] }[]).map((s) => ({ userId: s.user_id, fullName: s.full_name, role: s.role }));
  }

  async listCustomers(search: string | undefined, page: number) {
    let query = this.client.from('customers').select('id, full_name, phone_e164, email, area, created_at', { count: 'exact' }).is('deleted_at', null);
    const s = search ? safeSearch(search) : '';
    if (s) query = query.or(`full_name.ilike.%${s}%,phone_e164.ilike.%${s}%,email.ilike.%${s}%`);
    const [from, to] = range(page);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) fail(error);
    return { rows: (data as CustomerDb[]).map(toCustomerRow), total: count ?? 0 };
  }

  async getCustomer(id: string): Promise<CustomerDetail | null> {
    const { data, error } = await this.client.from('customers').select('id, full_name, phone_e164, email, area, created_at, notes, tags, whatsapp_opt_in_at, whatsapp_opted_out_at').eq('id', id).maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const c = data as CustomerDb;
    const { data: enquiries, error: enquiryError } = await this.client.from('enquiries').select(ENQUIRY_LIST).eq('customer_id', id).order('created_at', { ascending: false }).limit(50);
    if (enquiryError) fail(enquiryError);
    return {
      ...toCustomerRow(c), notes: c.notes ?? null, tags: c.tags ?? [], whatsappOptInAt: c.whatsapp_opt_in_at ?? null, whatsappOptedOutAt: c.whatsapp_opted_out_at ?? null,
      enquiries: (enquiries as unknown as EnquiryDb[]).map(toRow),
    };
  }

  updateCustomer(id: string, input: CustomerInput) {
    return this.touched(this.client.from('customers').update({ full_name: input.fullName, email: input.email, area: input.area, notes: input.notes, tags: input.tags }).eq('id', id).select('id'));
  }
}
