import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { query } from "./db";
import type { User } from "./types";
const derive = promisify(scrypt);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await derive(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const [salt, hex] = encoded.split(":");
  if (!salt || !hex || hex.length !== 128) return false;
  const actual = (await derive(password, salt, 64)) as Buffer;
  return timingSafeEqual(actual, Buffer.from(hex, "hex"));
}
export function digest(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get("hopviec_session")?.value;
  if (!token) return null;
  const rows = await query<User>(
    "SELECT u.id,u.name,u.email,u.role,u.company FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?",
    [digest(token), new Date().toISOString()],
  );
  return rows[0] || null;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query("DELETE FROM sessions WHERE expires_at<?", [
    new Date().toISOString(),
  ]);
  await query(
    "INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)",
    [digest(token), userId, expires.toISOString()],
  );
  (await cookies()).set("hopviec_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get("hopviec_session")?.value;
  if (token)
    await query("DELETE FROM sessions WHERE token_hash=?", [digest(token)]);
  jar.delete("hopviec_session");
}
