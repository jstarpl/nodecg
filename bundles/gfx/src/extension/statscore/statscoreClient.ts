import fetch from "node-fetch-commonjs";

const MAX_AGE = 30 * 60 * 1000;
const localCache: Record<string, any> = {};

type QueryArguments = Record<string, string | undefined>;

export class StatscoreClient {
	private _apiUrl: string;
	private _clientId: number;
	private _secretKey: string;

	private _token: string | undefined = undefined;
	private _expires: number | undefined = undefined;

	defaultQueryArguments: QueryArguments | undefined = undefined;

	constructor(apiUrl: string, clientId: number, secretKey: string) {
		this._apiUrl = apiUrl;
		this._clientId = clientId;
		this._secretKey = secretKey;
	}

	private _formatUrl(method: string, queryArguments: QueryArguments) {
		const baseUrl = new URL(`${this._apiUrl}${method}`);
		for (let [key, value] of Object.entries(queryArguments)) {
			if (value === undefined) continue;
			baseUrl.searchParams.append(key, value);
		}
		return baseUrl.toString();
	}

	private async _refreshToken() {
		const url = this._formatUrl("/oauth", {
			client_id: String(this._clientId),
			secret_key: this._secretKey,
		});
		const tokenResponse = await fetch(url);
		const tokenObj = (await tokenResponse.json()) as any;

		if (tokenObj.api && tokenObj.api.data && tokenObj.api.data.token) {
			this._token = tokenObj.api.data.token;
			this._expires = tokenObj.api.data.token_expiration * 1000;
		} else {
			console.error(url);
			console.error(JSON.stringify(tokenObj, undefined, 2));
			throw new Error("Unknown response on token request");
		}
	}

	private async _request(
		method: string,
		queryArguments: QueryArguments | undefined,
		cache: boolean = false
	) {
		if (!this._token || !this._expires || this._expires < Date.now()) {
			await this._refreshToken();
		}
		const url = this._formatUrl(method, {
			...this.defaultQueryArguments,
			...queryArguments,
			token: this._token,
		});

		// check cache before doing an actual query. If the token changed, will do query again.
		if (cache === true) {
			const cached = localCache[url];
			if (cached && cached.updated && cached.updated + MAX_AGE > Date.now()) {
				return cached.data;
			} else {
				localCache[url] = undefined;
			}
		}

		const requestResponse = await fetch(url);
		const dataObj = (await requestResponse.json()) as any;

		if (dataObj.api && dataObj.api.data) {
			if (cache === true) {
				localCache[url] = {
					updated: Date.now(),
					data: dataObj,
				};
			}
			return dataObj;
		} else {
			console.error(url);
			console.error(JSON.stringify(dataObj, undefined, 2));
			throw new Error(`Unknown response on request to ${method}`);
		}
	}

	async sportsList(queryArguments?: QueryArguments, cache = false) {
		return this._request("/sports", queryArguments, cache);
	}

	async sportsShow(
		sportId: number,
		queryArguments?: QueryArguments,
		cache = false
	) {
		return this._request(`/sports/${sportId}`, queryArguments, cache);
	}

	async eventsList(queryArguments?: QueryArguments, cache = false) {
		return this._request(`/events`, queryArguments, cache);
	}

	async eventsShow(
		eventId: number,
		queryArguments?: QueryArguments,
		cache = false
	) {
		return this._request(`/events/${eventId}`, queryArguments, cache);
	}

	async participantsShow(
		participantId: number,
		queryArguments?: QueryArguments,
		cache = false
	) {
		return this._request(
			`/participants/${participantId}`,
			queryArguments,
			cache
		);
	}

	async seasonsList(queryArguments?: QueryArguments, cache = false) {
		return this._request(`/events`, queryArguments, cache);
	}
}
