import { createStaffCms, type Cms } from '@backend/modules/cms';
import { contentPublisher } from './publisher';

/** Per-request content management for the signed-in staff member (RLS decides what succeeds). */
export function getCms(): Promise<Cms> {
  return createStaffCms(contentPublisher);
}
