import type { AuthenticatedUser } from './rbac';
import { ForbiddenError } from '../db/errors';

export function requireAssignedJob(user: AuthenticatedUser, job: { mechanic_id: number | null }, requestedMechanicId?: unknown) {
  if (user.role !== 'mechanic') return;
  if (job.mechanic_id !== user.user_id) {
    throw new ForbiddenError('Mechanics can only update their own assigned jobs');
  }
  if (requestedMechanicId !== undefined && Number(requestedMechanicId) !== job.mechanic_id) {
    throw new ForbiddenError('Only an administrator or service advisor can assign mechanics');
  }
}
