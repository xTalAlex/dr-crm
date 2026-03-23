import { apiHandler } from "@/lib/api";

export const prerender = false;

function escapeCsv(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export const GET = apiHandler(async (_ctx, { prisma }) => {
    const customers = await prisma.customer.findMany({
        orderBy: [{ surname: "asc" }, { name: "asc" }],
    });

    const headers = [
        "Cognome",
        "Nome",
        "Telefono",
        "Telefono 2",
        "Email",
        "Codice Fiscale",
        "Data di Nascita",
        "Indirizzo",
        "Note",
        "Data Creazione",
    ];

    const rows = customers.map((c) => [
        escapeCsv(c.surname ?? ""),
        escapeCsv(c.name ?? ""),
        escapeCsv(c.phone ?? ""),
        escapeCsv(c.phone2 ?? ""),
        escapeCsv(c.email ?? ""),
        escapeCsv(c.fiscalCode ?? ""),
        c.birthDate ? new Date(c.birthDate).toLocaleDateString("it-IT") : "",
        escapeCsv(c.address ?? ""),
        escapeCsv(c.notes ?? ""),
        new Date(c.createdAt).toLocaleDateString("it-IT"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="clienti-${date}.csv"`,
        },
    });
});
