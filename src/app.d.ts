// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare const __BUILD_DATE__: string;

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		
		interface ActionData {
			success?: boolean;
			message?: string;
			error?: string;
		}
	}
}

export {};
