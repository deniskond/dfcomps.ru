export function getInsertPlayersQuery(cupId: number): string {
  return `
        INSERT INTO cups_results ("server", "cupId", "userId") 
        VALUES 
            (1, ${cupId}, 10),
            (1, ${cupId}, 12),
            (1, ${cupId}, 13),
            (1, ${cupId}, 14),
            (1, ${cupId}, 15),
            (1, ${cupId}, 16),
            (1, ${cupId}, 17),
            (1, ${cupId}, 18),
            (1, ${cupId}, 19),
            (1, ${cupId}, 20),
            (2, ${cupId}, 21),
            (2, ${cupId}, 22),
            (2, ${cupId}, 23),
            (2, ${cupId}, 24),
            (2, ${cupId}, 25),
            (2, ${cupId}, 26),
            (2, ${cupId}, 27),
            (2, ${cupId}, 28),
            (2, ${cupId}, 29)
    `;
}
