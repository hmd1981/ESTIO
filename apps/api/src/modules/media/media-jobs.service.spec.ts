import { Test } from '@nestjs/testing';
import type { MediaGenerationJob } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { StatusService } from '../status/status.service';
import { MediaJobsService } from './media-jobs.service';
import { MediaWorkerService } from './media-worker.service';

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('MediaJobsService', () => {
  let service: MediaJobsService;
  let rowSnapshot: Record<string, unknown>;
  let prisma: {
    mediaGenerationJob: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let mediaWorker: {
    submitMediaJobToWorker: jest.Mock;
    getMediaWorkerMode: jest.Mock;
  };

  beforeEach(async () => {
    rowSnapshot = {
      id: 'job-1',
      type: 'text_to_image',
      status: 'queued',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      startedAt: null,
      completedAt: null,
      inputPayload: { mode: 'text_to_image', prompt: 'hi' },
      inputMeta: {},
      resultPayload: null,
      errorPayload: null,
      errorMessage: null,
      upstreamHttpStatus: null,
      workerRemoteJobId: null,
      workerTargetHost: null,
    };

    const mediaJobApi = {
      create: jest.fn(async () => ({ ...rowSnapshot })),
      findUnique: jest.fn(async () => ({ ...rowSnapshot } as MediaGenerationJob)),
      findUniqueOrThrow: jest.fn(async () => ({ ...rowSnapshot } as MediaGenerationJob)),
      update: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(rowSnapshot, data);
        return { ...rowSnapshot } as MediaGenerationJob;
      }),
      delete: jest.fn(),
    };
    prisma = {
      mediaGenerationJob: mediaJobApi,
      creditLedger: {
        findFirst: jest.fn(async () => null),
      },
      $transaction: jest.fn(async (fn: (tx: { mediaGenerationJob: typeof mediaJobApi }) => Promise<unknown>) =>
        fn({ mediaGenerationJob: mediaJobApi }),
      ),
    } as unknown as typeof prisma;

    mediaWorker = {
      submitMediaJobToWorker: jest.fn().mockResolvedValue({
        kind: 'inline_completed',
        result: { image_url: 'https://cdn.example.com/out.png' },
      }),
      getMediaWorkerMode: jest.fn().mockReturnValue('sync'),
    };

    const status = {
      isWorkerOnlineFast: jest.fn().mockReturnValue(true),
      lastReason: jest.fn().mockReturnValue(null),
    };

    const credits = {
      // Anonymous-job tests only ever look at the refund path, which returns
      // early because creditLedger.findFirst is stubbed null. Provide stubs
      // for the debit/refund methods so the type check is happy.
      debitForJob: jest.fn(async () => ({ created: true, balanceAfter: 0, rowId: 'x' })),
      refundJob: jest.fn(async () => ({ created: true, balanceAfter: 0, rowId: 'y' })),
      creditForPayment: jest.fn(),
      append: jest.fn(),
      getBalance: jest.fn(async () => 0),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MediaJobsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MediaWorkerService, useValue: mediaWorker },
        { provide: StatusService, useValue: status },
        { provide: CreditsService, useValue: credits },
      ],
    }).compile();

    service = moduleRef.get(MediaJobsService);
  });

  it('runs text_to_image through worker and marks job completed (in-process queue)', async () => {
    await service.createStudioMediaJob(
      {
        mode: 'text_to_image',
        prompt: 'hi',
      },
      'user-1',
    );
    await flushMicrotasks();
    await flushMicrotasks();

    expect(mediaWorker.submitMediaJobToWorker).toHaveBeenCalledWith(
      'text_to_image',
      expect.objectContaining({ mode: 'text_to_image', prompt: 'hi' }),
    );
    expect(rowSnapshot.status).toBe('completed');
    expect(rowSnapshot.resultPayload).toEqual({
      image_url: 'https://cdn.example.com/out.png',
    });
  });

  it('passes image_to_video payload with image_base64 to the worker layer', async () => {
    rowSnapshot.type = 'image_to_video';
    rowSnapshot.inputPayload = {
      mode: 'image_to_video',
      prompt: 'move',
      image_base64: 'QQ==',
    };
    prisma.mediaGenerationJob.create.mockResolvedValue({
      ...rowSnapshot,
    } as MediaGenerationJob);

    await service.createStudioMediaJob(
      {
        mode: 'image_to_video',
        prompt: 'move',
        image_base64: 'QQ==',
      },
      'user-1',
    );
    await flushMicrotasks();
    await flushMicrotasks();

    expect(mediaWorker.submitMediaJobToWorker).toHaveBeenCalledWith(
      'image_to_video',
      expect.objectContaining({
        mode: 'image_to_video',
        image_base64: 'QQ==',
      }),
    );
  });
});
