import fs from 'node:fs/promises';
import path from 'node:path';
import { sync as spawnSync } from 'cross-spawn';
import set from 'lodash.set';
import unset from 'lodash.unset';

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isErrnoException(
  error: unknown,
): error is NodeJS.ErrnoException {
  return (
    isObject(error) &&
    error instanceof Error &&
    (typeof error.errno === 'number' || error.errno === undefined) &&
    (typeof error.code === 'string' || error.code === undefined) &&
    (typeof error.path === 'string' || error.path === undefined) &&
    (typeof error.syscall === 'string' || error.syscall === undefined)
  );
}

export async function copy(src: string, dest: string) {
  const stat = await fs.stat(src);
  await (stat.isDirectory() ? copyDir(src, dest) : fs.copyFile(src, dest));
}

async function copyDir(srcDir: string, destDir: string) {
  await fs.mkdir(destDir, { recursive: true });
  for (const file of await fs.readdir(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    void copy(srcFile, destFile);
  }
}

export async function remove(src: string) {
  await fs.rm(src, { force: true, recursive: true });
}

export function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  );
}

export function getAuthor() {
  const result = spawnSync('git', ['config', 'user.name']);
  if (result.error) {
    throw result.error;
  }

  return result.stdout.toString('utf8').trim();
}

export async function editJson(
  filePath: string,
  fields: Record<string, unknown>,
) {
  const jsonFile = await fs.readFile(filePath, 'utf8');
  const json = JSON.parse(jsonFile) as Record<string, unknown>;
  for (const [key, value] of Object.entries(fields)) {
    if (value) {
      set(json, key, value);
    } else {
      unset(json, key);
    }
  }

  await fs.writeFile(filePath, JSON.stringify(json, null, 2));
}

export function execute(commandString: string) {
  const [command, ...args] = commandString.split(' ');
  const result = spawnSync(command, args);

  console.log(result.stdout.toString('utf8'));

  if (result.error) {
    throw result.error;
  }
}
