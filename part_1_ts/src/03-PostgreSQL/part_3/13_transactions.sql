-- ==============================================
-- Transactions
    -- Multiple sql statements run as one safe unit. So, multiple database changes must succeed together or fail/cancel together.
    -- e.g. In e-commerce: pleacing order - reduce stock of products - Create payment records - Transfer amount - Create user records with related profile data
    -- Transaction starts with BEGIN & ends with COMMIT
    -- If the first update changes the status, will the second update see the changed value? - Yes, absolutely. second UPDATE can see the change made by the first UPDATE
-- ==============================================

BEGIN;

UPDATE posts
SET status = 'published'
WHERE title = 'Indexes for Beginners' AND status = 'draft';

UPDATE posts
SET views = views + 100
WHERE title = 'Indexes for Beginners';

COMMIT;

SELECT title, status, views
FROM posts
WHERE title = 'Indexes for Beginners';