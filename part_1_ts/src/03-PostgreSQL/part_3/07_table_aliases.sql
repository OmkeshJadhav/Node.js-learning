SELECT 
    p.title AS post_title,
    p.status,
    p.views,
    c.body,
    u.name

FROM posts AS p

INNER JOIN users AS u
    ON p.user_id = u.id

LEFT JOIN comments AS c
    ON c.post_id = p.id

ORDER BY p.views DESC;