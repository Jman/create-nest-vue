#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import minimist from 'minimist';

import {
  isErrnoException,
  execute,
  copy,
  remove,
  isValidPackageName,
  getAuthor,
  editJson,
} from './helpers.js';

if (process.argv.length < 3) {
  console.log('You have to provide a name to your app.');
  console.log('For example :');
  console.log('pnpm exec create-nest-vue my-app');
  process.exit(1);
}

const vuePkg = 'ui';
const nestPkg = 'api';
const defaultTargetDir = 'nest-vue-project';
const filesToRemove = [
  `${vuePkg}/.vscode`,
  `${vuePkg}/.prettierrc.json`,
  `${vuePkg}/.gitignore`,
];
const argv = minimist(process.argv.slice(2), { string: ['_'] });

const templateDir = path.resolve(
  fileURLToPath(import.meta.url),
  '../..',
  'template',
);

async function main() {
  const targetDir = argv._[0] || defaultTargetDir;
  const isCwd = targetDir === '.';
  const projectName = isCwd ? path.basename(path.resolve()) : targetDir;
  const currentPath = process.cwd();
  const projectPath = path.join(currentPath, targetDir);

  if (!isValidPackageName(projectName)) {
    console.log(`"${projectName}" is not valid project name`);
  }

  if (!isCwd) {
    try {
      await fs.mkdir(projectPath);
    } catch (error: unknown) {
      if (isErrnoException(error) && error.code === 'EEXIST') {
        console.log(
          `The file "${projectName}" already exist in the current directory, please give it another name.`,
        );
      } else {
        console.log(error);
      }

      process.exit(1);
    }

    process.chdir(projectPath);
  }

  console.log('Installing Nest...');

  execute(
    `pnpm --silent --package @nestjs/cli dlx nest new ${nestPkg} --package-manager pnpm --skip-git`,
  );

  await editJson(path.join(projectPath, `${nestPkg}/package.json`), {
    'scripts.dev': 'pnpm run start:dev',
  });

  console.log('Installing Vue...');
  execute(
    `pnpm create vue@3 ${vuePkg} --ts --router --pinia --vitest --playwright --eslint-with-prettier`,
  );

  console.log('Copying Files...');
  const files = await fs.readdir(templateDir);
  await Promise.all(
    files.map(async (file) => {
      const src = path.join(templateDir, file);
      const dest = path.join(
        projectPath,
        file === 'gitignore' ? '.gitignore' : file,
      );
      return copy(src, dest);
    }),
  );

  await editJson(path.join(projectPath, 'package.json'), {
    name: projectName,
    author: getAuthor(),
  });

  console.log('Instaling Dependencies...');
  execute(`pnpm --filter=${vuePkg} install`);

  console.log('Cleaning Files...');

  for (const file of filesToRemove) {
    const src = path.join(projectPath, file);
    void remove(src);
  }

  console.log('Init Git');
  execute(`git init`);
}

try {
  await main();
} catch (error: unknown) {
  console.error(error);
}
