-- null: Unkonwn/missing value
-- empty string: Known string value but it contains no character
-- zero: actual numeric value of 0

DROP TABLE IF EXISTS basics.value_examples;

CREATE TABLE basics.value_examples(
    nickname TEXT,
    bio VARCHAR(100),
    age INTEGER
);

INSERT INTO basics.value_examples(nickname, bio, age)
VALUES
    (null, '', 0),
    (null, null, null),
    ('Omkesh', 'Omkesh bio', 10),
    (null, 'descr', 0);

-- SELECT * FROM basics.value_examples;

-- null and not null
SELECT * FROM basics.value_examples WHERE nickname IS NULL;
SELECT * FROM basics.value_examples WHERE nickname IS NOT NULL;

-- empty string
SELECT * FROM basics.value_examples WHERE bio = '';
SELECT * FROM basics.value_examples WHERE bio != '';
SELECT * FROM basics.value_examples WHERE bio <> '';
        -- Both <> and != mean "not equal" in PostgreSQL.

-- zero and not zero
SELECT * FROM basics.value_examples WHERE age = 0;
SELECT * FROM basics.value_examples WHERE age <> 0;


-- | What you're checking    | Operator      | Example                |
-- | ----------------------- | ------------- | ---------------------- |
-- | NULL                    | `IS NULL`     | `nickname IS NULL`     |
-- | Not NULL                | `IS NOT NULL` | `nickname IS NOT NULL` |
-- | String/value equality   | `=`           | `bio = ''`             |
-- | String/value inequality | `<>` or `!=`  | `bio <> ''`            |
-- | Number equality         | `=`           | `age = 0`              |
-- | Number inequality       | `<>` or `!=`  | `age <> 0`             |

-- NULL is special is that you cannot use = to check NULL