export default function greekLetters(id: string): string {
    const replacements: Record<string, string> = {
        kkg: "ΚΚΓ",
        kat: "ΚΑΘ",
        dg: "ΔΓ",
        sa: "ΣΑ",
        pm: "ΦΜ",
        dz: "ΔΖ",
        sc: "ΣΧ",
    };
    return replacements[id] ?? id;
}
