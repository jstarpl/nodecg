export const KNOWN_ASSET_TYPES = [
	// images
	'apng',
	'png',
	'jpe?g',
	'jfif',
	'pjpeg',
	'pjp',
	'gif',
	'svg',
	'ico',
	'webp',
	'avif',

	// media
	'mp4',
	'webm',
	'ogg',
	'mp3',
	'wav',
	'flac',
	'aac',
	'opus',

	// fonts
	'woff2?',
	'eot',
	'ttf',
	'otf',

	// other
	'webmanifest',
	'pdf',
	'txt',
];

export const DEFAULT_ASSETS_RE = new RegExp(`\\.(` + KNOWN_ASSET_TYPES.join('|') + `)(\\?.*)?$`);
