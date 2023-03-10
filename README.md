# create-nest-vue

Install nest and vue into workspaces, pnpm is required.

## Getting Started

```shell
pnpm create nest-vue <project_name>
```

This command will install [NestJS](https://nestjs.com) into `api` workspace and [Vue.js](https://vuejs.org) into `ui`. Vue is installing with `--ts --router --pinia --vitest --playwright --eslint-with-prettier` option enabled.

## Usage

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

Will run Vue dev server on <http://127.0.0.1:5173/> and NestJS on <http://127.0.0.1:3000/>. Vite dev server will proxy request on <http://127.0.0.1:5173/api> to NestJS

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

## Release History

### 1.0.2

- Replace XO with Prettier/Eslint
- Update README

### 1.0.1

- Add git initialization
- Add `.gitignore`
- Add README

### 1.0.0

- Initial commit
