import argon2 from "argon2";

export function hashString(str: string) {
	return argon2.hash(str);
}
