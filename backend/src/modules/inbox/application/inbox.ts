import { err, ok, type Result } from '@backend/kernel';
import type { CustomerDetail, CustomerRow, EnquiryDetail, EnquiryQuery, EnquiryRow, StaffOption } from '../domain';
import { RepositoryError, type InboxRepository } from './ports';
import { customerInputSchema, noteSchema, statusSchema } from './schemas';

export type InboxError = { code: 'invalid'; field?: string } | { code: 'forbidden' } | { code: 'not-found' } | { code: 'unavailable' };

export function createInbox(repo: InboxRepository) {
  async function run<T>(action: () => Promise<T>): Promise<Result<T, InboxError>> {
    try {
      return ok(await action());
    } catch (error) {
      if (error instanceof RepositoryError) return err({ code: error.kind });
      throw error;
    }
  }
  const found = <T>(r: Result<T | null, InboxError>): Result<T, InboxError> => (!r.ok ? r : r.value ? ok(r.value) : err({ code: 'not-found' }));

  return {
    listEnquiries: (query: EnquiryQuery): Promise<Result<{ rows: readonly EnquiryRow[]; total: number }, InboxError>> => run(() => repo.listEnquiries({ ...query, page: Math.max(1, query.page) })),
    getEnquiry: async (id: string): Promise<Result<EnquiryDetail, InboxError>> => found(await run(() => repo.getEnquiry(id))),
    async setStatus(id: string, raw: unknown): Promise<Result<true, InboxError>> {
      const status = statusSchema.safeParse(raw);
      if (!status.success) return err({ code: 'invalid', field: 'status' });
      return run(async () => (await repo.setStatus(id, status.data), true as const));
    },
    assign: (id: string, userId: string | null) => run(async () => (await repo.assign(id, userId), true as const)),
    async addNote(enquiryId: string, raw: unknown): Promise<Result<true, InboxError>> {
      const note = noteSchema.safeParse({ body: raw });
      if (!note.success) return err({ code: 'invalid', field: 'body' });
      return run(async () => (await repo.addNote(enquiryId, note.data.body), true as const));
    },
    listStaff: (): Promise<Result<readonly StaffOption[], InboxError>> => run(() => repo.listStaff()),
    listCustomers: (search: string | undefined, page: number): Promise<Result<{ rows: readonly CustomerRow[]; total: number }, InboxError>> => run(() => repo.listCustomers(search, Math.max(1, page))),
    getCustomer: async (id: string): Promise<Result<CustomerDetail, InboxError>> => found(await run(() => repo.getCustomer(id))),
    async updateCustomer(id: string, raw: unknown): Promise<Result<true, InboxError>> {
      const parsed = customerInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: String(parsed.error.issues[0]?.path[0] ?? parsed.error.issues[0]?.message ?? '') });
      return run(async () => (await repo.updateCustomer(id, parsed.data), true as const));
    },
  };
}

export type Inbox = ReturnType<typeof createInbox>;
