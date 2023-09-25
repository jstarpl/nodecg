// Native
import path from 'path';

// Packages
import type express from 'express';
import isChildOf from './isChildOf';

// Ours
import { DEFAULT_ASSETS_RE } from './knownAssetTypes';

export default (
	directoryToPreventTraversalOutOf: string,
	fileLocation: string,
	res: express.Response,
	next: express.NextFunction,
): void => {
	if (isChildOf(directoryToPreventTraversalOutOf, fileLocation)) {
		if (DEFAULT_ASSETS_RE.test(fileLocation)) {
			res.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=36000');
		}

		res.sendFile(fileLocation, (err: NodeJS.ErrnoException) => {
			if (err) {
				if (err.code === 'ENOENT') {
					return res.type(path.extname(fileLocation)).sendStatus(404);
				}

				/* istanbul ignore next */
				if (!res.headersSent) {
					next(err);
				}
			}

			return undefined;
		});
	} else {
		res.sendStatus(404);
	}
};
