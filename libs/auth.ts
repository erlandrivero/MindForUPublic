import { getServerSession } from "next-auth";
import { authOptions } from "./next-auth";

export async function getAuthSession() {
  return await getServerSession(authOptions);
}
