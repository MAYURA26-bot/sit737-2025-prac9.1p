db = db.getSiblingDB('calculator'); // use or create the "calculator" database

db.createUser({
  user: "calcuser",
  pwd: "calcpass123",
  roles: [
    {
      role: "readWrite",
      db: "calculator"
    }
  ]
});