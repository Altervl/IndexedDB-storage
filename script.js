// Создать базу данных
const db = new Dexie("dataBase");

// Создать таблицу
db.version(1).stores({
  dataBase: '++id, параметр, значение'
});

// Функция чтения CSV файла
function readCSV(file) {
  let reader = new FileReader();

  // Прочесть, как текст
  reader.readAsText(file);

  // При успешной загрузке получить текст, спарсить, как csv файл
  // и вернуть результат
  reader.onload = function(event) {
    console.log(reader.result);

    const text = event.target.result;
    const data = parseCSV(text);

    return data;
  };

  // При ошибке вывести сообщение в консоль
  reader.onerror = function() {
    console.log(reader.error);
  };
};

// Функция для парсинга CSV
function parseCSV(text) {
  // Получить строки из файла
  const rows = text.split('\n');

  // Получить заголовки столбцов
  const headers = rows[0].split(',');

  // Создать массив содержимого
  const content = [];

  // Пройти по каждой строке после заголовков
  for (let i = 1; i < rows.length; i++) {
    // Получить значения в ячейках
    const row = rows[i].split(',');
    
    // Создать объект строки и записать в него содержимое ячеек
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });

    // Добавить объект в массив
    content.push(rowData);
  };

  // Вернуть получившийся массив
  return content;
};

// Функция импорта csv файла
function importCSV(file) {
  const content = readCSV(file);
  db.dataBase.bulkAdd(content);
};

// Получить выбранный файл и записать в базу данных
const input = document.getElementById('input');
const container = document.getElementById('container');
csvFile.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    importCSV(file);
    console.log("imported!");
  };  
});
