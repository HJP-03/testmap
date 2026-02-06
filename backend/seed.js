const { dbAsync } = require('./db');

(async () => {
    try {
        console.log("Seeding database...");
        const id = Date.now().toString();
        const timestamp = Date.now();

        await dbAsync.run(
            `INSERT INTO markers (id, lat, lng, db, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [id, 37.5665, 126.9780, 45, timestamp] // Seoul City Hall, Quiet
        );

        console.log("Inserted test marker at Seoul City Hall.");

        const rows = await dbAsync.all("SELECT * FROM markers");
        console.log("Current DB rows:", rows);

    } catch (err) {
        console.error("Seeding failed:", err);
    }
})();
