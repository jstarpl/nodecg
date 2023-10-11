import { useEffect, useRef, useState } from "react";

export function useDebouncedState<T>(
	initial: T,
	ms: number,
	liveValue: T,
	callback?:
		| ((newVal: T, oldVal: T) => void)
		| ((newVal: T, oldVal: T) => Promise<void>)
): T {
	const [val, setVal] = useState<T>(initial);
	const track = useRef<T>(initial);

	useEffect(() => {
		const t = setTimeout(() => {
			const oldVal = track.current;
			track.current = liveValue;

			if (callback) {
				const retVal = callback(liveValue, oldVal);
				if (retVal instanceof Promise) {
					retVal.then(() => {
						setVal(liveValue);
					});
					return;
				}
			}

			setVal(liveValue);
		}, ms);

		return () => {
			clearTimeout(t);
		};
	}, [ms, liveValue, callback]);

	return val;
}

export function useDebouncedLeadingEdgeState<T>(
	initial: T,
	ms: number,
	liveValue: T,
	callback?: (newVal: T, oldVal: T) => (() => void) | undefined
): T {
	const [val, setVal] = useState<T>(initial);
	const track = useRef<T>(initial);
	const cleanup = useRef<(() => void) | undefined>(undefined);

	useEffect(() => {
		if (callback) {
			cleanup.current = callback(liveValue, track.current);
		}

		const t = setTimeout(() => {
			track.current = liveValue;

			if (cleanup.current) {
				cleanup.current();
				cleanup.current = undefined;
			}

			setVal(liveValue);
		}, ms);

		return () => {
			clearTimeout(t);
		};
	}, [ms, liveValue, callback]);

	return val;
}
