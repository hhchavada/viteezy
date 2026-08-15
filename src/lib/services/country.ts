"use server";
import { cookies } from "next/headers";

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = "NEXT_COUNTRY";

export async function getUserCountry() {
  return (await cookies()).get(COOKIE_NAME)?.value || "in";
}

export async function setUserCountry(country: any) {
  (await cookies()).set(COOKIE_NAME, country);
}
