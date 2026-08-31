import { existsSync, realpathSync } from 'node:fs';
import { join, normalize, sep } from 'node:path';
import {
  CLEANUP_ALLOWLISTED_LOG_DIR,
  CLEANUP_ALLOWLISTED_UPLOAD_SUBDIRS,
} from './cleanup.config';

/**
 * Resolve an absolute path and verify it stays under an approved cleanup root.
 * Never follows symlinks out of the tree (realpath on the candidate file).
 */
export function isUnderApprovedCleanupDir(
  absolutePath: string,
  approvedRoots: string[],
): boolean {
  const normalized = normalize(absolutePath);
  let resolved: string;
  try {
    resolved = realpathSync(normalized);
  } catch {
    return false;
  }
  return approvedRoots.some((root) => {
    if (!existsSync(root)) return false;
    const resolvedRoot = realpathSync(root);
    return resolved === resolvedRoot || resolved.startsWith(resolvedRoot + sep);
  });
}

export function buildApprovedFileRoots(cwd: string): string[] {
  const uploadDirs = CLEANUP_ALLOWLISTED_UPLOAD_SUBDIRS.map((d) =>
    join(cwd, d),
  );
  const logsDir = join(cwd, CLEANUP_ALLOWLISTED_LOG_DIR);
  return [...uploadDirs, logsDir];
}

export function assertDeletableFile(
  absolutePath: string,
  approvedRoots: string[],
): void {
  if (!isUnderApprovedCleanupDir(absolutePath, approvedRoots)) {
    throw new Error(`Refusing cleanup outside allowlist: ${absolutePath}`);
  }
}
