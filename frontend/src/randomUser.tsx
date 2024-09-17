import { User } from './PageManager';

// TURN ON/OFF RANDOM USER DEBUG
export const randomDebug = false;
// TURN ON/OFF RANDOM USER DEBUG

const randomNames = [
	'umbrella', 'cactus', 'marble', 'velvet', 'zeppelin', 'treasure', 'galaxy', 
	'quiver', 'lamp', 'plum', 'echo', 'serpent', 'cherry', 'guitar', 'flame', 
	'spark', 'dagger', 'whisper', 'canyon', 'puzzle', 'jungle', 
	'sandwich', 'orbit', 'monkey', 'crystal', 'lighthouse', 'tornado', 'satellite', 
	'honey', 'breeze', 'bubble', 'fortune', 'copper', 'glacier', 'quartz', 'safari', 
	'oasis', 'compass', 'violet', 'shadow', 'feather', 'rhythm', 'nebula', 
	'harvest', 'raven', 'meadow', 'thunder', 'iceberg', 'whisker', 
	'nightmare', 'mystic', 'goblin', 'carousel', 'phoenix', 'vortex', 'opal', 
	'geyser', 'chameleon', 'meteor', 'diamond', 'fog', 'tumble',
	'prism', 'clover', 'mermaid', 'ember', 'sphinx', 'quicksilver', 
	'panther', 'bamboo', 'fossil', 'crescent', 'onyx', 'pyramid',
	'tidal', 'eclipse', 'labyrinth', 'pineapple', 'walnut', 
	'volcano', 'serenade', 'catapult', 'goblet', 'silver', 'orchid', 
	'tiger', 'telescope', 'zephyr', 'ghost', 'pebble', 'icicle', 'kaleidoscope', 
	'crimson', 'pearl', 'fountain', 'turquoise', 'treetop', 'magnolia', 
	'tigerlily', 'serenade', 'turret', 'florence', 'pistachio', 'waterfall', 
	'starlight', 'aurora', 'snowflake', 'hazel', 'whale', 'echo', 'lighthouse', 
	'meadow', 'quasar', 'dragonfly', 'volcano', 'aurora', 'moonstone', 
	'bramble', 'goblet', 'daisy', 'cerulean', 'falcon', 'primrose', 'quicksand', 
	'watermelon', 'maple', 'horizon', 'glowworm', 'icicle', 'storm', 
	'pomegranate', 'solstice', 'mirage', 'plume', 'willow', 'twilight', 'cascade', 
	'ember', 'lilac', 'mistletoe', 'florence', 'jaguar', 'glow', 'zinnia', 
	'starling', 'compass', 'mirage', 'ocean', 'sapphire', 'whirlpool', 'galaxy', 
	'thunder', 'dusk', 'rainbow', 'breeze', 'poppy', 'labyrinth', 'solace', 
	'fig', 'yonder', 'orchard', 'cascade', 'meadow', 'topaz', 'citron', 
	'phoenix', 'lynx', 'coral', 'storm', 'pearl', 'lagoon', 'firefly', 
	'crescent', 'amethyst', 'skylark', 'copper', 'seashell', 'terracotta', 
	'moss', 'gale', 'nectar', 'seraph', 'onyx', 'ember', 'fjord', 'lotus', 
	'maple', 'tangerine', 'gleam', 'ember', 'gossamer', 'lunar', 'quill'
];
const randomNamesLength = randomNames.length;

function getCookie(name: string): string | undefined {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(';').shift();
	return undefined;
}

function setCookie(name: string, value: string, hours: number): void {
	let expires = '';
	if (hours) {
		const date = new Date();
		date.setTime(date.getTime() + (hours * 60 * 60 * 1000)); // Convert hours to milliseconds
		expires = `; expires=${date.toUTCString()}`;
	}
	document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

let randomNamesIndex = parseInt(getCookie('randomNamesIndex') || '0', 10) || 0;

export const createRandomUser = (user: User): User => {
	const randomUser: User = {
		id: randomNamesIndex.toString(),
		username: randomNames[randomNamesIndex],
		avatarURL:  user.avatarURL,
		TwoFactorSecret: user.TwoFactorSecret,
		TwoFactorEnabled: user.TwoFactorEnabled
	};
	randomNamesIndex = (randomNamesIndex + 1) % randomNamesLength;
	setCookie('randomNamesIndex', randomNamesIndex.toString(), 4); // Persist for 4 hours
	return randomUser;
};

