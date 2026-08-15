DROP TABLE IF EXISTS basics.app_events;

CREATE TABLE basics.app_events (
    -- uuid: 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_name TEXT NOT NULL,

    -- JSONB - store JSON data in binary format. Use when you need to have flexible structured meta data for a particular column.
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO basics.app_events (event_name, metadata)
VALUES
    (
        'sign_up',
        '{"browser": "chrome"}'
    ),
    (
        'sign_in',
        '{"user": "Omkesh"}'
    );
    
SELECT * FROM basics.app_events;

-- Getting JSON values as text
SELECT event_name, metadata ->> 'browser' AS browser
FROM basics.app_events
WHERE metadata ? 'browser';