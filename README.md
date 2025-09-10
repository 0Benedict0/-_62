Доступные маршруты для проверки:

/users— список пользователей ( PUG )

/users/1— подробная страница пользователя

/articles— список статей ( EJS )

/articles/1— подробная страница статьи

/set-theme/darkили /set-theme/light— меняет тему через cookie

POST /register— регистрация пользователя (через Postman или curl)

POST /login- вход (вернет JWT в cookie)

/profile- защищённый маршрут (доступен только после входа)
