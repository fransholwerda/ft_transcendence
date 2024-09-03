export interface Theme {
	bg: string;
	inner: string;
	text: string;
	extra: string;
}

export const themes = new Map<string, Theme>([
	['default', {
		bg: '#26547c',
		inner: '#ef476f',
		text: '#ffd166',
		extra: '#06d6a0'
	}],
	['lighter', {
		bg: '#ffa69e',
		inner: '#faf3dd',
		text: '#b8f2e6',
		extra: '#aed9e0'
	}],
	['darker', {
		bg: '#003049',
		inner: '#d62828',
		text: '#f77f00',
		extra: '#fcbf49'
	}],
	['unicorn', {
		bg: '#70d6ff',
		inner: '#ff70a6',
		text: '#e7ecef',
		extra: '#ffd670'
	}]
]);
