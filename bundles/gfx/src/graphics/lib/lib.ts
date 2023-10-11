import { useOnlyReplicantValue } from "common/useReplicant";
import { useMemo } from "react";

export function getLogo(type: "men" | "women", shortName: string) {
	return `../shared/dist/${type}/logos/${shortName}.png`;
}

export function getFlag(ccode: string) {
	return `images/logos/${ccode.toLowerCase()}.png`;
}

export function getPhoto(
	type: "men" | "women",
	shortName: string,
	numberOrName: string
) {
	if (!numberOrName) return "";

	const fileName = numberOrName.replaceAll(/\s+/g, "_");
	return `../shared/dist/${type}/photos/${shortName}/${fileName}.png`;
}

export function useType(): "men" | "women" {
	return useOnlyReplicantValue("menOrWomen") ?? "men";
}

export function useSuperscriptText(text: string) {
	const processedCommentHTML = useMemo(() => {
		const comment = text.replace(/(\d+)(st|nd|rd|th)/i, "$1<sup>$2</sup>");
		return { __html: comment };
	}, [text]);

	return processedCommentHTML;
}
