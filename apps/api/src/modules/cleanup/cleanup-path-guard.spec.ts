import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  assertDeletableFile,
  buildApprovedFileRoots,
  isUnderApprovedCleanupDir,
} from './cleanup-path-guard';

describe('cleanup-path-guard', () => {
  let cwd: string;
  let approved: string[];

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'estio-cleanup-'));
    for (const sub of [
      'uploads/tmp',
      'uploads/.temp',
      'uploads/previews',
      'uploads/samples',
      'logs',
    ]) {
      mkdirSync(join(cwd, sub), { recursive: true });
    }
    approved = buildApprovedFileRoots(cwd);
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it('allows files under allowlisted upload tmp', () => {
    const file = join(cwd, 'uploads', 'tmp', 'temp-abc.txt');
    writeFileSync(file, 'x');
    expect(isUnderApprovedCleanupDir(file, approved)).toBe(true);
    expect(() => assertDeletableFile(file, approved)).not.toThrow();
  });

  it('rejects files outside allowlisted directories', () => {
    mkdirSync(join(cwd, 'uploads', 'protected'), { recursive: true });
    const file = join(cwd, 'uploads', 'protected', 'hero.png');
    writeFileSync(file, 'x');
    expect(isUnderApprovedCleanupDir(file, approved)).toBe(false);
    expect(() => assertDeletableFile(file, approved)).toThrow(
      /Refusing cleanup outside allowlist/,
    );
  });
});
