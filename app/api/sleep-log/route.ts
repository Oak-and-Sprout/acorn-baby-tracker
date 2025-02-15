import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, SleepLogCreate, SleepLogResponse } from '../types';

export async function POST(req: NextRequest) {
  try {
    const body: SleepLogCreate = await req.json();
    
    const sleepLog = await prisma.sleepLog.create({
      data: {
        ...body,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : undefined,
      },
    });

    return NextResponse.json<ApiResponse<SleepLogResponse>>({
      success: true,
      data: sleepLog,
    });
  } catch (error) {
    console.error('Error creating sleep log:', error);
    return NextResponse.json<ApiResponse<SleepLogResponse>>(
      {
        success: false,
        error: 'Failed to create sleep log',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: Partial<SleepLogCreate> = await req.json();

    if (!id) {
      return NextResponse.json<ApiResponse<SleepLogResponse>>(
        {
          success: false,
          error: 'Sleep log ID is required',
        },
        { status: 400 }
      );
    }

    const sleepLog = await prisma.sleepLog.update({
      where: { id },
      data: {
        ...body,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
      },
    });

    return NextResponse.json<ApiResponse<SleepLogResponse>>({
      success: true,
      data: sleepLog,
    });
  } catch (error) {
    console.error('Error updating sleep log:', error);
    return NextResponse.json<ApiResponse<SleepLogResponse>>(
      {
        success: false,
        error: 'Failed to update sleep log',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Sleep log ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.sleepLog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting sleep log:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete sleep log',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const babyId = searchParams.get('babyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {
      deletedAt: null,
      ...(id && { id }),
      ...(babyId && { babyId }),
      ...(startDate && endDate && {
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    if (id) {
      const sleepLog = await prisma.sleepLog.findFirst({
        where,
      });

      if (!sleepLog) {
        return NextResponse.json<ApiResponse<SleepLogResponse>>(
          {
            success: false,
            error: 'Sleep log not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse<SleepLogResponse>>({
        success: true,
        data: sleepLog,
      });
    }

    const sleepLogs = await prisma.sleepLog.findMany({
      where,
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json<ApiResponse<SleepLogResponse[]>>({
      success: true,
      data: sleepLogs,
    });
  } catch (error) {
    console.error('Error fetching sleep logs:', error);
    return NextResponse.json<ApiResponse<SleepLogResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch sleep logs',
      },
      { status: 500 }
    );
  }
}
