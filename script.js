// Создать базу данных
const db = new Dexie("MyDatabase");

// Создать таблицу
db.version(1).stores({
  myTable: '++id, параметр, значение'
});
