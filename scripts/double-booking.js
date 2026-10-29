const db = require('../src/db');

const API_URL = 'http://localhost:3000/api/reservations';
const ROOM_ID = 1;
const REQUEST_COUNT = 10;

// Termin w przyszłości, wspólny dla wszystkich requestów.
const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
start.setSeconds(0, 0);

const end = new Date(start.getTime() + 60 * 60 * 1000);

async function main() {
    const payload = {
        roomId: ROOM_ID,
        title: 'Test double booking',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
    };

    console.log('Testowany przedział:');
    console.log('Od:', payload.startTime);
    console.log('Do:', payload.endTime);
    console.log(`Wysyłam ${REQUEST_COUNT} równoległych requestów...\n`);

    try {
        const results = await Promise.all(
            Array.from({ length: REQUEST_COUNT }, async (_, index) => {
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });

                    const body = await response.text();

                    console.log(
                        `Request ${index + 1}: HTTP ${response.status} — ${body}`
                    );

                    return {
                        status: response.status,
                        body,
                    };
                } catch (error) {
                    console.error(
                        `Request ${index + 1}: błąd połączenia — ${error.message}`
                    );

                    return { status: null, body: error.message };
                }
            })
        );

        console.log('\nPodsumowanie statusów HTTP:');
        const statusCounts = {};

        for (const result of results) {
            const key = result.status ?? 'NETWORK_ERROR';
            statusCounts[key] = (statusCounts[key] ?? 0) + 1;
        }

        console.log(statusCounts);

        const countResult = await db('reservations')
            .where('room_id', ROOM_ID)
            .where('status', 'CONFIRMED')
            .where('start_time', '<', end)
            .where('end_time', '>', start)
            .count({ total: 'id' })
            .first();

        console.log(
            '\nLiczba rezerwacji CONFIRMED nakładających się na przedział:',
            Number(countResult.total)
        );
    } finally {
        await db.destroy();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
