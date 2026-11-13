import { NextRequest } from 'next/server';
import { queryOne } from '@/lib/db/mysql';
import { NotFoundError, ValidationError } from '@/lib/db/errors';
import { handleApiError, jsonSuccess } from '@/lib/utils/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const catalogueId = Number((await params).id);
    if (!catalogueId || isNaN(catalogueId)) {
      throw new ValidationError('Invalid catalogue ID');
    }

    const item = await queryOne<any>(
      `SELECT * FROM vehicle_catalogue WHERE catalogue_id = ?`,
      [catalogueId]
    );

    if (!item) {
      throw new NotFoundError(`Vehicle catalogue specification #${catalogueId} not found`);
    }

    return jsonSuccess({ catalogue_item: item });
  } catch (error) {
    return handleApiError(error);
  }
}

