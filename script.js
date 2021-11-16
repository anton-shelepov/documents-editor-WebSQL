// Есть протокол (документ), есть номер, задача - ввести в БД 31(дирекция 2-3 шт)/4(подразделение 2-3 шт)/6(пользователь в каждой дирекции (уникальная нумерация)), 
// при форматировании документа не допустить дублирование номеров
// Проверяется документ. Формироваться документ может сразу с двух источников. В единой базе брать по номермам пользователей
// Выбирается дирекция, подразделение, фамилию. 


var db = openDatabase("itemDB", "1.0", "itemDB", 65535); // Наименование базы данных


$(function () {

    loadData(); // Вызывается при загрузке страницы, для формирования базы данных


    // СОЗДАНИЕ ТАБЛИЦЫ (НАЧАЛО) 
    $("#create").click(function () {
        db.transaction(function (transaction) { // Создание базы данных, с соответсвтующими полями
            var sql = "CREATE TABLE items " +
                "(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," + // Ключ типа "число", не равняется null
                "document_number VARCHAR(100) NOT NULL," + // Номер документа типа "Символ - длина 100", не равняется null
                "direction VARCHAR(100) NOT NULL," + // Дирекция типа "Символ - длина 100", не равняется null
                "subdivision VARCHAR(100) NOT NULL," + // Подразделение типа "Символ - длина 100", не равняется null
                "user_last_name VARCHAR(100) NOT NULL)"; // Фамилия пользователя типа "Символ - длина 100", не равняется null
            transaction.executeSql(sql, undefined, function () {
                alert("Таблица успешно создана"); // Сообщение при успешном создании
            }, function () {
                alert("Таблица уже создана"); // Сообщение при ошибке
            })
        });
    });
    // СОЗДАНИЕ ТАБЛИЦЫ (КОНЕЦ)



    // УДАЛЕНИЕ ТАБЛИЦЫ (НАЧАЛО)
    $("#remove").click(function () { // Обработка нажатия кнопки "Удалить таблицу"
        if (!confirm("Удалить таблицу ?", "")) return; // Если пользователь нажал "Да"
        db.transaction(function (transaction) {
            var sql = "DROP TABLE items"; // Полное удаление таблицы items
            transaction.executeSql(sql, undefined, function () {
                alert("Таблица успешно удалена") // Сообщение при успешном удалении
            }, function (transaction, err) {
                alert(err.message); // Сообщение при ошибке удаления
            })
        });
    });
    // УДАЛЕНИЕ ТАБЛИЦЫ (КОНЕЦ)



    // ВВОД ДАННЫХ В ТАБЛИЦУ (НАЧАЛО) 
    $("#insert").click(function () {
        var document_number = $("#number_input").val(); // Инициализация переменных и присваивание значений из полей
        var direction = $("#direction_input").val(); // Переменная "Дирекция" - внесение в нее данных из поля direction_input
        var subdivision = $("#subdivision_input").val(); // Переменная "Подразделение" - внесение в нее данных из поля subdivision_input
        var user_last_name = $("#last_name_input").val(); // Переменная "Фамилия пользователя" - внесение в нее данных из поля last_name_input 

        var isNumberRepeated = false

        db.transaction(function (transaction) {
            var sql = "SELECT * FROM items ORDER BY id DESC"; // Выбор всех элементов из таблицы items по их ключам


            transaction.executeSql(sql, undefined, function (transaction, result) {
                for (var index = 0; index < result.rows.length; index++) {
                    if ($("#number_input").val() === result.rows.item(index).document_number) {
                        isNumberRepeated = true
                        return alert("Такой номер документа уже существует в базе данных")
                    }
                }
            })
        })
        setTimeout(function () {
            if (document_number != '' && direction != '' && subdivision != '' && user_last_name != '' && isNumberRepeated === false) { // Проверка на пустые поля 

                db.transaction(function (transaction) {
                    var sql = "INSERT INTO items(document_number,direction,subdivision,user_last_name) VALUES(?,?,?,?)"; // Установка ячеек таблицы БД для заполнения
                    transaction.executeSql(sql, [document_number, direction, subdivision, user_last_name], function () {  // Заполнение ячеек данным из переменных
                        alert("Новый документ успешно добавлен"); // Сообщение при успешом добавлении
                    }, function (transaction, err) {
                        alert("Для создания нового документа, необходимо добавить таблицу"); // Сообщение при ошибке
                    }) 
                }) 
            }
            else if (document_number === '' || direction === '' || subdivision === '' || user_last_name === '') return (alert("Необходимо заполнить все поля ввода")) // Сообщение при незаполненных полях ввода
            else return null
        }, 100)

    })
    // ВВОД ДАННЫХ В ТАБЛИЦУ (КОНЕЦ)


    // ЗАПРОСИТЬ ДАННЫЕ 
    $("#list").click(function () { // Обработка нажатия кнопки "Запросить все документы"
        loadData();
    })



    // ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ в БД (НАЧАЛО)
    function loadData() {
        db.transaction(function (transaction) {
            var sql = "SELECT * FROM items ORDER BY id DESC"; // Выбор всех элементов из таблицы items по их ключам
            transaction.executeSql(sql, undefined, function (transaction, result) {
                if (result.rows.length) {
                    $("#itemlist").children().remove(); // Очищение всех дочерних элементов таблицы, для обновления на новые
                    $("#itemlist").append('<tr><th>Документ №</th><th>Дирекция</th><th>Подразделение</th><th>Фамилия</th><th>Действие</th></tr>') // Добавление заголовков полей таблицы
                    for (var i = 0; i < result.rows.length; i++) { // Цикл от нуля до количества строк таблицы items

                        var row = result.rows.item(i); // Переменная, содержащая объект с данными текущей строки
                        var id = row.id; // Занесение данных из таблицы БД, в переменные, для дальнейшей отрисовки данных
                        var document_number = row.document_number; // "Номер документа" - внесение данных из ячейки с наименованием document_number текущей строки
                        var direction = row.direction; // "Дирекция" - внесение данных из ячейки с наименованием document_number текущей строки
                        var subdivision = row.subdivision; // "Подразделение" - внесение данных из ячейки с наименованием subdivision текущей строки
                        var user_last_name = row.user_last_name; // "Фамилия" - внесение данных из ячейки с наименованием user_last_name текущей строки

                        $("#itemlist").append('<tr id="del' + id + '"><td>' + document_number + '</td><td>' + direction + '</td><td>' + subdivision + '</td><td>' + user_last_name + '</td><td><a href="#" class="table_btn" data-id="' + id + '">Удалить</a>');
                    }
                } else {
                    $("#itemlist").children().remove();
                    $("#itemlist").append('<tr><td>Документы не найдены</td></tr>'); // Вывод при отсутствии документов в таблице items
                }
            }, function (transaction, err) {
                alert('Таблиц не найдено. Нажмите "Создать таблицу", чтобы добавить новую'); // Сообщение при отсутствии таблиц в БД
            })
        })




        //setTimeout - нужен для того, чтобы синхронизировать дейсвтие удаления элемента

        setTimeout(function () { // Установка таймера на 1 секунду
            $(".table_btn").click(function () { // Обработка нажатия кнопки "Удалить" в таблице
                var sure = confirm("Вы уверены что хотите удалить данный документ ?");
                if (sure === true) { // Срабатывает при нажатии на кнопку "Да" в диалоговом окне
                    var id = $(this).data("id"); // Получение ключа элемента

                    db.transaction(function (transaction) {
                        var sql = "DELETE FROM items where id=?"; // Сообщаем БД, что из таблицы items удалится элемент с id=?
                        transaction.executeSql(sql, [id], function () {
                            $("#del" + id).fadeOut(); // Получаем id элемента, которых будет удален
                            alert("Документ успешно удален"); // Сообщение при успешном удалении
                        }, function (transaction, err) {
                            alert(err.message); // Сообщение при ошибке удаления
                        })
                    });
                }
            })
        }, 1000);


    }
    // ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ в БД (КОНЕЦ)




});