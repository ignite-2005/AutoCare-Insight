export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { getRepairReportsCollection } from '@/lib/db/mongodb';
import { execute, queryOne } from '@/lib/db/mysql';
import { NotFoundError, ValidationError } from '@/lib/db/errors';
import { requireAuth } from '@/lib/auth/session';
import { enforcePermission } from '@/lib/auth/rbac';
import { validateRepairReport } from '@/lib/validation/repair-report';
import { handleApiError, jsonSuccess, jsonCreated } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    enforcePermission(user, 'view_reports');

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('job_id');
    const vehicleId = searchParams.get('vehicle_id');
    const mechanicId = searchParams.get('mechanic_id');
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 25, 1), 50);

    const filter: any = {};
    if (jobId) filter.job_id = Number(jobId);
    if (vehicleId) filter.vehicle_id = Number(vehicleId);
    if (mechanicId) filter.mechanic_id = Number(mechanicId);

    const collection = await getRepairReportsCollection();
    const reports = await collection.find(filter).sort({ created_at: -1 }).limit(limit).toArray();

    return jsonSuccess({
      reports,
      count: reports.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    enforcePermission(user, 'create_reports');

    const rawBody = await req.json().catch(() => ({}));
    // Enforce current mechanic id if role is mechanic
    if (user.role === 'mechanic') {
      rawBody.mechanic_id = user.user_id;
    }

    const validatedDoc = validateRepairReport(rawBody);

    const job = await queryOne<any>('SELECT job_id, vehicle_id FROM service_jobs WHERE job_id = ?', [validatedDoc.job_id]);
    if (!job) throw new NotFoundError('Service job not found');
    if (job.vehicle_id !== validatedDoc.vehicle_id) throw new ValidationError('Vehicle does not match the service job');
    const collection = await getRepairReportsCollection();
    const insertResult = await collection.insertOne({ ...validatedDoc, created_at: new Date(validatedDoc.created_at) } as any);
    const mongoId = insertResult.insertedId.toString();

    // Cross-paradigm integration: update MySQL service_jobs.mongo_report_id
    try {
      await execute(
        `UPDATE service_jobs SET mongo_report_id = ? WHERE job_id = ?`,
        [mongoId, validatedDoc.job_id]
      );
    } catch (error) {
      await collection.deleteOne({ _id: insertResult.insertedId });
      throw error;
    }

    return jsonCreated({
      report: {
        _id: mongoId,
        ...validatedDoc
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

