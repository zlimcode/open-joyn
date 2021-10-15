import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;

const outputMainBunde = {
	input: ['src/main.ts'],

	external: ['three', 'codemirror', 'js-beautify'],

	output: {
		format: 'iife',
		name: 'OPENJOYN',
		file: 'dist/openjoyn.js',
		sourcemap: true,
		globals: {
			three: 'THREE',
		},
	},
	plugins: [
		resolve({
			preferBuiltins: false,
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

export default [
	outputMainBunde
];
