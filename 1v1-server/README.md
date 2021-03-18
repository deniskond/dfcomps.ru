# DFCOMPS 1v1 server

Server is designed to host 1v1 matches, do the matchmaking, pickbans and send result to dfcomps backend.
Backend interaction is done via secret key, so it is the only thing which can not be tested after cloning repo.

# Starting instructions

```
git clone https://github.com/deniskond/dfcomps.ru-frontend.git
cd 1v1-server
npm install
npm start
```

# Описание взаимодействия клиент-сервер:

1. При подключении клиента генерируется uuid для этого соединения
2. На каждое сообщение от клиента проверяется есть ли уже открытый матч с этим клиентом
- Если клиент уже есть в списке и его uuid совпадает, то клиент не добавляется
- Если uuid не совпадает, но совпадает playerId и есть открытое соединение по вебсокету, значит открыта вторая вкладка. Посылается сообщение DUPLICATE_CLIENT на предыдущее соединение, текущее при этом остается
- Если соединение по вебсокету закрыто, но playerId есть в списке, то обновляем ему uniqueId и сокет. Это может произойти когда от клиента не пришло событие завершения соединения по сокету и он подключается во второй раз (обрыв связи / отключение электричества, не отработал ngOnDestroy)
- Если playerId нет в списке, то просто добавляем его в список клиентов
3. Ожидаемый порядок клиент-серверных сообщений:
1) Клиент зашел в очередь и вышел из нее
- Клиент: GET_PLAYER_STATE
- Сервер: PLAYER_STATE
- Клиент: JOIN_QUEUE
- Сервер: JOIN_QUEUE_SUCCESS
- Клиент: LEAVE_QUEUE
- Сервер: LEAVE_QUEUE_SUCCESS
2) Клиент зашел в очередь, нашел матч и сыграл его, при этом банил первым
- Клиент: GET_PLAYER_STATE
- Сервер: PLAYER_STATE
- Клиент: JOIN_QUEUE
- Сервер: JOIN_QUEUE_SUCCESS
- Сервер: PICKBAN_STEP
- (Опционально) Клиент: BAN_MAP
- Сервер: PICKBAN_STEP
- (Опционально) Клиент: BAN_MAP
- Сервер: PICKBAN_STEP
- Сервер: MATCH_FINISHED
- Клиент: MATCH_RESULT_ACCEPTED
3) Клиент зашел в очередь, нашел матч и сыграл его, при этом банил вторым
- Клиент: GET_PLAYER_STATE
- Сервер: PLAYER_STATE
- Клиент: JOIN_QUEUE
- Сервер: JOIN_QUEUE_SUCCESS
- Сервер: PICKBAN_STEP
- Сервер: PICKBAN_STEP
- (Опционально) Клиент: BAN_MAP
- Сервер: PICKBAN_STEP
- (Опционально) Клиент: BAN_MAP
- Сервер: PICKBAN_STEP
- Сервер: MATCH_FINISHED
- Клиент: MATCH_RESULT_ACCEPTED
3) Клиент зашел в очередь и выключил интернет
(не готово, сейчас будут ошибки в этом кейсе)

4. Обработка ошибок на сервере:
1) Приходит JOIN_QUEUE, когда игрок уже в матче либо в очереди. Сервер отвечает сообщением JOIN_QUEUE_FAILURE
2) Клиент присылает сообщение со второго сокета для того же игрока со второй вкладки в браузере. Сервер посылает сообщение DUPLICATE_CLIENT первому клиенту