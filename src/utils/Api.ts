import type { AskRequest, AskResponse } from "../types/types";

export async function askCharacter(input: AskRequest): Promise<AskResponse> {
  const res = await fetch("http://localhost:8080/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, style: input.style || "default" }),
  });

  return res.json();
}
