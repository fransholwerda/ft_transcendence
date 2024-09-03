export interface Theme {
	bg: string;
	inner: string;
	text: string;
	extra: string;
}

export const themes = new Map<string, Theme>([
	['default', {
		bg: '#bcb8b1',
		inner: '#463f3a',
		text: '#f4f3ee',
		extra: '#8a817c'
	}],
	['Wooden', {
		bg: '#a44200',
		inner: '#3c1518',
		text: '#d58936',
		extra: '#69140e'
	}],
	['Coral Breeze', {
		bg: '#ffa69e',
		inner: '#faf3dd',
		text: '#b8f2e6',
		extra: '#aed9e0'
	}],
	['Twilight Ember', {
		bg: '#003049',
		inner: '#d62828',
		text: '#f77f00',
		extra: '#fcbf49'
	}],
	['Dreamscape Aura', {
		bg: '#70d6ff',
		inner: '#ff70a6',
		text: '#e7ecef',
		extra: '#ffd670'
	}]
]);
/*
darkness
3th
1th
4th
2th
*/
