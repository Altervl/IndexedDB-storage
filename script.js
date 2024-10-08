// Создать базу данных
const db = new Dexie("dataBase");

// Создать таблицу
db.version(1).stores({
  dataTable: '++id, параметр, значение'
});

// Функция чтения CSV файла
async function readCSV(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    // Прочесть файл, как текст
    reader.readAsText(file);

    // При успешной загрузке получить текст,
    // спарсить, как csv файл, и вернуть результат
    reader.onload = function(event) {
      console.log(reader.result);

      const text = event.target.result;
      const data = parseCSV(text);

      // Вернуть данные через promise
      resolve(data);
    };

    // При отклонении promise вернуть ошибку
    reader.onerror = function() {
      reject(new Error('Ошибка чтения файла'))
    };
  });
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
async function importCSV(file) {
  try {
    // Ждать чтения файла и парсинга данных
    const content = await readCSV(file);

    // Ждать добавления данных в БД
    await db.dataTable.bulkAdd(content);
  } catch (error) {
    console.error("Ошибка импорта данных", error);
  };
};

// Функция отображения данных из БД
async function displayTable() {
  try {
    // Получить данные из БД
    const dbData = await db.dataTable.toArray();

    // Если таблица пуста, вывести об этом сообщение и выйти из функции
    if (dbData.length === 0) {
      console.log("Данных нет");
      return;
    };

    // Выбрать заголовки и тело таблицы
    const tHeader = document.getElementById('theader');
    const tBody = document.getElementById('tbody');

    // Очистить содержимое
    tHeader.textContent = '';
    tBody.textContent = '';

    // Создать заголовки таблицы из первой строки БД, исключить id
    const tHeaders = Object.keys(dbData[0]).filter(header => header !== 'id');

    // Заполнить заголовки
    tHeaders.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      tHeader.appendChild(th);
    });

    // Заполнить ячейки:
    // для каждой строки в БД создать строку в HTML...
    dbData.forEach(row => {
      const tr = document.createElement('tr');

      // ...и в каждой созданной строке заполнить ячейки под соответствующим столбцом
      tHeaders.forEach(header => {
        const td = document.createElement('td');
        td.textContent = row[header];

        // Вставить ячейку в строку
        tr.appendChild(td);
      });

      // Вставить созданную строку в тело таблицы
      tBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Ошибка отображения данных')
  };
};

// Получить выбранный файл и записать в базу данных
const input = document.getElementById('input');
const container = document.getElementById('container');
input.addEventListener('change', async function(event) {
  const file = event.target.files[0];
  if (file) {
    // Ждать завершения импорта файла и обновлять таблицу на странице
    await importCSV(file);
    await displayTable();
  };
});

// Построить таблицу при загрузке страницы
window.onload = function() {
  displayTable();
};
