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

    // Очистить таблицу в БД перед новым импортом
    await db.dataTable.clear();

    // Добавить новые строки с данными
    for (const row of content) {
      db.dataTable.add(row);
    };
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

        // Сделать ячейку редактируемой
        td.contentEditable = 'true';

        // Сохранить изменения при потере фокуса
        td.addEventListener('blur', async function() {
          // Получить новое значение ячейки
          const newValue = td.textContent;

          // Обновить записть в IndexedDB
          await db.dataTable.update(row.id, { [header]: newValue });
        });

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

// Функция экспорта данных из БД в csv
async function exportCSV() {
  try {
    // Получить данные из БД
    const expData = await db.dataTable.toArray();

    // Если данные в БД отсутствуют, вывести сообщение об этом в консоль
    // и выйти из функции
    if (expData.length === 0) {
      console.log("Нет данных для экспорта");
      return;
    }

    // Создать заголовки, исключить id
    const expHeaders = Object.keys(expData[0]).filter(header => header !== 'id');

    // Создать массив строк для экспорта
    // Заголовки
    let expContent = expHeaders.join(',') + '\n';

    // Данные
    expData.forEach(row => {
      // Создать строку таблицы с парой данных "параметр-значение"
      const expRow = expHeaders.map(header => row[header]);

      // Добавить строку в массив
      expContent += expRow.join(',') + '\n';

    });

    // Скачать файл с записанными данными
    downloadCSV(expContent, 'export.csv');
  } catch (error) {
    
    // Вывести в консоль сообщение об ошибке при неудаче
    console.error('Ошибка экспорта данных', error);
  };
};

// Функция скачивания экспортированного CSV файла
function downloadCSV(fileData, fileName) {
  // Создать объект для будущего файла
  const blob = new Blob([fileData], {type: 'text/csv;charset=utf-8;'});

  // Создать ссылку для скачивания
  const link = document.createElement('a');

  // создать URL для ссылки
  const url = URL.createObjectURL(blob);

  // Добавить ссылке URL, привязать имя файла для скачивания и скрыть из видимости
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';

  // Добавить ссылку на страницу
  document.body.appendChild(link);
  
  // Автоматически нажать для скачивания файла
  link.click();
  
  // Удалить ссылку со страницы
  document.body.removeChild(link);
};

// Получить выбранный файл и записать в базу данных
const input = document.getElementById('input');
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

// Экспорт данных в CSV файл
const expButton = document.getElementById('export');
expButton.addEventListener('click', exportCSV);
