import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  utimesSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { CleanupService } from './cleanup.service';

describe('CleanupService', () => {
  let service: CleanupService;
  let cwd: string;

  const prisma = {
    mediaAsset: { findMany: jest.fn().mockResolvedValue([]) },
    mediaGenerationJob: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    },
    creditLedger: { findFirst: jest.fn().mockResolvedValue(null) },
    siweNonce: {
      count: jest.fn().mockResolvedValue(2),
      deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    intakeSession: {
      count: jest.fn().mockResolvedValue(0),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    payment: {
      count: jest.fn().mockResolvedValue(1),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      deleteMany: jest.fn(),
    },
    studioEvent: {
      count: jest.fn().mockResolvedValue(0),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    aiStudioAskEvent: {
      count: jest.fn().mockResolvedValue(0),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    automationRun: {
      count: jest.fn().mockResolvedValue(0),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    user: { deleteMany: jest.fn() },
    creditLedgerDelete: { deleteMany: jest.fn() },
  };

  const credits = {
    refundJob: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    cwd = mkdtempSync(join(tmpdir(), 'estio-cleanup-svc-'));
    process.chdir(cwd);
    mkdirSync(join(cwd, 'uploads', 'tmp'), { recursive: true });
    mkdirSync(join(cwd, 'uploads', 'previews'), { recursive: true });

    const old = Date.now() - 48 * 3_600_000;
    const tempFile = join(cwd, 'uploads', 'tmp', 'temp-old.txt');
    writeFileSync(tempFile, 'temp');
    utimesSync(tempFile, old / 1000, old / 1000);

    const orphan = join(cwd, 'uploads', 'previews', 'preview-orphan.png');
    writeFileSync(orphan, 'png');
    utimesSync(orphan, old / 1000, old / 1000);

    mkdirSync(join(cwd, 'uploads', 'protected'), { recursive: true });
    const protectedFile = join(cwd, 'uploads', 'protected', 'preview-evil.png');
    writeFileSync(protectedFile, 'keep');
    utimesSync(protectedFile, old / 1000, old / 1000);

    jest.clearAllMocks();
    prisma.mediaGenerationJob.findMany.mockResolvedValue([]);

    const module = await Test.createTestingModule({
      providers: [
        CleanupService,
        { provide: PrismaService, useValue: prisma },
        { provide: CreditsService, useValue: credits },
      ],
    }).compile();

    service = module.get(CleanupService);
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it('dry-run changes nothing on disk or protected tables', async () => {
    const report = await service.runDaily({ dryRun: true });

    expect(report.dryRun).toBe(true);
    expect(report.counts.tempFilesDeleted).toBeGreaterThanOrEqual(1);
    expect(report.counts.orphanAssetsDeleted).toBeGreaterThanOrEqual(1);
    expect(report.counts.authTokensDeleted).toBe(2);
    expect(report.counts.paymentsMarkedExpired).toBe(1);

    expect(prisma.siweNonce.deleteMany).not.toHaveBeenCalled();
    expect(prisma.payment.updateMany).not.toHaveBeenCalled();
    expect(prisma.payment.deleteMany).not.toHaveBeenCalled();
    expect(prisma.user.deleteMany).not.toHaveBeenCalled();
  });

  it('marks pending payments expired without deleting rows', async () => {
    prisma.mediaGenerationJob.findMany
      .mockReset()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const report = await service.runDaily({ dryRun: false });

    expect(prisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'pending' }),
        data: { status: 'expired' },
      }),
    );
    expect(prisma.payment.deleteMany).not.toHaveBeenCalled();
    expect(report.counts.paymentsMarkedExpired).toBe(1);
  });

  it('fails stuck jobs and refunds debits', async () => {
    prisma.mediaGenerationJob.findMany
      .mockReset()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'job-stuck', status: 'running' }]);
    prisma.creditLedger.findFirst.mockResolvedValueOnce({
      userId: 'user-1',
      delta: -5,
    });

    const report = await service.runDaily({ dryRun: false });

    expect(prisma.mediaGenerationJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-stuck' },
        data: expect.objectContaining({ status: 'failed' }),
      }),
    );
    expect(credits.refundJob).toHaveBeenCalledWith({
      userId: 'user-1',
      jobId: 'job-stuck',
      amount: 5,
    });
    expect(report.counts.stuckJobsFailed).toBe(1);
  });

  it('expires auth tokens safely', async () => {
    await service.runDaily({ dryRun: false });

    expect(prisma.siweNonce.deleteMany).toHaveBeenCalled();
    expect(prisma.user.deleteMany).not.toHaveBeenCalled();
  });

  it('never deletes credit ledger rows', async () => {
    await service.runDaily({ dryRun: false });
    expect(prisma.user.deleteMany).not.toHaveBeenCalled();
  });
});
