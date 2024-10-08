// Создать базу данных
const db = new Dexie("DB");

// Создать таблицу
db.version(1).stores({
  myTable: '++id, параметр, значение';
});

// Выбрать и прочитать csv файл
const csvFile = document.querySelector('#file');
const content = readCSV(csvFile)

// Функция чтения CSV файла
function readCSV(file) {
  let csv = file.files[0];
  let reader = new FileReader();

  reader.readAsText(csv);
  reader.onload = function(event) {
    console.log(reader.result);

    const text = event.target.result;
    const data = parseCSV(text);

    return data;
  };

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
