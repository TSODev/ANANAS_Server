db.auth("root", "example");

db = db.getSiblingDB("ananas");

db.createUser({
  user: "admin",
  pwd: "12345678",
  roles: [
    {
      role: "readWrite",
      db: "ananas",
    },
    {
      role: "dbAdmin",
      db: "ananas",
    },
  ],
});
