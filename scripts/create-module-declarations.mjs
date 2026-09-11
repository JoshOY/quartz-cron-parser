import { copyFile } from 'node:fs/promises';

const declaration = new URL('../dist/types/src/index.d.ts', import.meta.url);

await Promise.all([
  copyFile(declaration, new URL('../dist/types/src/index.d.mts', import.meta.url)),
  copyFile(declaration, new URL('../dist/types/src/index.d.cts', import.meta.url)),
]);
