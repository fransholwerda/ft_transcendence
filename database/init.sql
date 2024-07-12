CREATE TABLE IF NOT EXISTS "USERS" (
    id INT PRIMARY KEY,
    name VARCHAR(20),
    username VARCHAR(20),
    password VARCHAR(20)
);

INSERT INTO "USERS" (id, name, username, password) VALUES (0, 'user1', 'UserOne', 'user1');
INSERT INTO "USERS" (id, name, username, password) VALUES (1, 'user2', 'UserTwo', 'user2');