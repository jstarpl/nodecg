export default {
	tableUrl:
		process.env.GENDER === "women"
			? "https://superligakobiet.pl/wp-json/statscore/v1/table/192"
			: "https://orlen-superliga.pl/wp-json/statscore/v1/table/192",
	statscore: {
		apiUrl: "https://api.statscore.com/v2",
		clientId: 531,
		username: "transmisje-live",
		secretKey: "VKgW6JpJ2drn05O2ACrUVL4Kpey1WAeKFhj",
		sportId: 6,
		seasonId: process.env.GENDER === "women" ? 58772 : 58734,
	},
};
