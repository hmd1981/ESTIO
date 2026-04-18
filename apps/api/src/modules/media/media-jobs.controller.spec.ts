import { PATH_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { MediaJobsController } from './media-jobs.controller';
import { MediaJobsService } from './media-jobs.service';
import { WalletAuthGuard } from '../wallet-auth/wallet-auth.guard';

describe('MediaJobsController', () => {
  let controller: MediaJobsController;
  let mediaJobs: {
    createStudioMediaJob: jest.Mock;
    createGenerateImageJob: jest.Mock;
    createGenerateMediaJob: jest.Mock;
    getJobStatus: jest.Mock;
    getJobResult: jest.Mock;
  };

  beforeEach(async () => {
    mediaJobs = {
      createStudioMediaJob: jest.fn(),
      createGenerateImageJob: jest.fn(),
      createGenerateMediaJob: jest.fn(),
      getJobStatus: jest.fn(),
      getJobResult: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [MediaJobsController],
      providers: [{ provide: MediaJobsService, useValue: mediaJobs }],
    })
      .overrideGuard(WalletAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = moduleRef.get(MediaJobsController);
  });

  it('registers under the media/jobs path prefix', () => {
    expect(Reflect.getMetadata(PATH_METADATA, MediaJobsController)).toBe(
      'media/jobs',
    );
  });

  it('POST / (createStudioMediaJob) forwards body to service', async () => {
    const res = { jobId: 'a', id: 'a' };
    mediaJobs.createStudioMediaJob.mockResolvedValue(res);
    const fakeReq = {
      walletUser: { id: 'user-1' },
    } as unknown as import('express').Request;
    await expect(
      controller.createStudioMediaJob(
        { mode: 'text_to_image', prompt: 'sunset' },
        fakeReq,
      ),
    ).resolves.toBe(res);
    expect(mediaJobs.createStudioMediaJob).toHaveBeenCalledWith(
      { mode: 'text_to_image', prompt: 'sunset' },
      'user-1',
    );
  });

  it('GET :id forwards id to getJobStatus', async () => {
    mediaJobs.getJobStatus.mockResolvedValue({ id: 'x' });
    await expect(controller.getStatus('x')).resolves.toEqual({ id: 'x' });
    expect(mediaJobs.getJobStatus).toHaveBeenCalledWith('x');
  });

  it('GET :id/result forwards id to getJobResult', async () => {
    mediaJobs.getJobResult.mockResolvedValue({ jobId: 'x', playback: null });
    await expect(controller.getResult('x')).resolves.toEqual({
      jobId: 'x',
      playback: null,
    });
    expect(mediaJobs.getJobResult).toHaveBeenCalledWith('x');
  });
});
