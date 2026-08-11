import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { z } from "zod";

/**
 * Comprueba si una contraseña aparece en filtraciones conocidas usando la API
 * de HaveIBeenPwned con k-anonimato: solo se envían los 5 primeros caracteres
 * del hash SHA-1, nunca la contraseña ni el hash completo.
 */
export const checkPasswordLeaked = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ password: z.string().min(1).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    const hash = createHash("sha1").update(data.password, "utf8").digest("hex").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    try {
      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { "Add-Padding": "true" },
      });
      if (!res.ok) return { leaked: false as const, checked: false as const };
      const body = await res.text();
      const leaked = body
        .split("\n")
        .some((line) => {
          const [hashSuffix, count] = line.trim().split(":");
          return hashSuffix === suffix && Number(count) > 0;
        });
      return { leaked, checked: true as const };
    } catch {
      return { leaked: false as const, checked: false as const };
    }
  });
