const db = require('./db');

(async () => {
    await db.ready;
    const hasData = db.get('SELECT COUNT(*) AS c FROM suspensions').c;
    if (hasData > 0) {
        console.log('Database already seeded. Skipping.');
        return;
    }

    db.run(
        'INSERT INTO announcements (title, body, event_date) VALUES (?, ?, ?)',
        [
            'September 3, 2026 — Active Weather Event',
            'Heavy rains from the enhanced Southwest Monsoon (Habagat) and Tropical Storm Pilandok have prompted widespread safety measures. Multiple Local Government Units (LGUs) have raised alerts and declared class suspensions.',
            '2026-09-03'
        ]
    );

    const seeds = [
        ['La Union', 'Agoo', 'Kindergarten – Senior High School (Public & Private)', null, null],
        ['La Union', 'Aringay', 'All Levels (Public & Private)', null, null],
        ['La Union', 'Burgos', 'All Levels (Public & Private)', null, null],
        ['La Union', 'Caba', 'All Levels', 'Asynchronous Modality', null],
        ['La Union', 'San Gabriel', 'All Levels (Public & Private)', null, null],
        ['La Union', 'Tubao', 'All Levels (Public & Private)', null, null],
        ['Pangasinan', 'Bugallon', 'All Levels (Public & Private)', null, null],
        ['Pangasinan', 'Mangaldan', 'All Levels', 'Alternative Delivery Modes', null],
        ['Pangasinan', 'San Carlos City', 'All Levels', 'Alternative Delivery Modes', null],
        ['Pampanga', 'City of San Fernando', 'All Levels', 'Alternative Delivery Modes', '2026-09-04'],
        ['Pampanga', 'Minalin', 'All Levels', 'Alternative Delivery Modes', '2026-09-04'],
        ['Pampanga', 'San Simon', 'All Levels', null, '2026-09-04']
    ];
    for (const row of seeds) {
        db.run(
            'INSERT INTO suspensions (province, municipality, level, modality, until_date) VALUES (?, ?, ?, ?, ?)',
            row
        );
    }

    const statusRows = [
        ['System Profile', 'Southwest Monsoon (Habagat) + Tropical Storm Pilandok', 'Heavy downpours; risk of flash floods and landslides.'],
        ['Government Work', 'Operational (unless local LGU issues specific orders)', 'Essential health and disaster response teams remain at full capacity.'],
        ['Private Sector', 'LGU Discretionary Advice', 'Employers encouraged to adopt flexible or remote work setups.']
    ];
    for (const row of statusRows) {
        db.run('INSERT INTO status (parameter, current_status, impact) VALUES (?, ?, ?)', row);
    }

    const tips = [
        ['Verify Before Commuting', "Check with your specific school or official LGU social media pages — suspension lists grow throughout the day. If your municipality is not listed, assume standard schedules apply.", 1],
        ['Monitor Alerts', 'Stay tuned to PAGASA Weather Advisories for real-time heavy rainfall and orange/red warning signals.', 2],
        ['Prepare a Go-Bag', 'Keep essentials (water, flashlight, phone power bank, first-aid, documents) ready in case of evacuation.', 3],
        ["Avoid Floodwaters", "Turn around, don't drown — just 15 cm of moving water can knock you down.", 4]
    ];
    for (const row of tips) {
        db.run('INSERT INTO tips (title, body, sort_order) VALUES (?, ?, ?)', row);
    }

    console.log('Seed complete.');
})();