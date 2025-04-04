import { defineConfig } from "eslint/config";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'


export default defineConfig([
	{
		files: ['**/*.ts', '**/*.js'],
		rules: {
			"prefer-const": "warn",
			"no-constant-binary-expression": "error",
		},
	},
]);