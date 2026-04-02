import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      ok: true,
      service: 'estio-api',
      timestamp: new Date().toISOString(),
    };
  }
}
