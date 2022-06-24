import { build } from 'esbuild';

const commonBuildOptions = {
  bundle: true,
  write: true,
  watch: false,
  format: 'esm',
  target: 'esnext',
  outdir: './dist',
  external: ['vm', 'https'],
  pure: ['console.log', 'console.time', 'console.timeEnd'],
  platform: 'node',
  minify: false,
};

try {
  /**
   * Main Entrypoint
   */
  await build({
    ...commonBuildOptions,
    entryPoints: {
      index: './src/index.ts',
    },
    outExtension: { '.js': '.cjs' },
    format: 'cjs',
  });

  await build({
    ...commonBuildOptions,
    entryPoints: {
      index: './src/index.ts',
    },
    format: 'esm',
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
