export interface Theme {
	color1: string;
	color2: string;
	color3: string;
	color4: string;
}

export const themes = new Map<string, Theme>([
	['default', {
		color1: '#d4e09b',
		color2: '#f6f4d2',
		color3: '#cbdfbd',
		color4: '#f19c79'
	}],
	['lighter', {
		color1: '#ffa69e',
		color2: '#faf3dd',
		color3: '#b8f2e6',
		color4: '#aed9e0'
	}],
	['darker', {
		color1: '#003049',
		color2: '#d62828',
		color3: '#f77f00',
		color4: '#fcbf49'
	}],
	['unicorn', {
		color1: '#70d6ff',
		color2: '#ff70a6',
		color3: '#e7ecef',
		color4: '#ffd670'
	}]
]);
