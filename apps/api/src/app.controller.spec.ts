import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return api health payload', () => {
      const result = appController.health();
      expect(result.ok).toBe(true);
      expect(result.service).toBe('estio-api');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
