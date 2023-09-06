const { Telegraf, Markup } = require('telegraf');
const api = require('./api'); // Импортируем токен из файла api.js

const bot = new Telegraf(api.token);
const userResponses = {}; // Здесь мы будем хранить ответы пользователей
// Обработчик команды /start
bot.start( (ctx) => {
    const welcomeMessage = `Привет, ${ctx.from.first_name}!\n\nОформлять полис желательно за 3⃣ дня, до предполагаемой поездки\n\nПочему это так важно?\n1⃣Полис регистрируется в базе от 1 до 3 дней.\n
Обычно на следующий день информация о полисе появляется на их сайте, но возможно отображение на третьи сутки.\n\n  
2⃣Проверка пограничниками.\n\nНа момент выезда полис должен отображаться в базе, иначе он, лишь бумажка для пограничника и сотрудник имеет полное право отказаться его принять.`;
    const photoPath = './assets/img/europolis1.png';

    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Предварительный расчет', 'calculate'),
        Markup.button.callback('Оформить полис онлайн', 'purchase'),
    ]);
    ctx.reply(welcomeMessage)
        .then(() => {
            ctx.replyWithPhoto({ source: photoPath })
                .then(() => {
                    ctx.telegram.sendMessage(ctx.chat.id, "Нажмите на одну из кнопок, чтобы сделать выбор", keyboard);
                });
        });

});



bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const userResponse = userResponses[userId];

    if (!userResponse) {
        // Пользователь отправил текст перед началом диалога
        await ctx.reply('Я бот, и не умею распознавать текст. Но я учусь, и скоро я буду вас понимать, а пока выбирайте то, что вам необходимо', Markup.inlineKeyboard([
            Markup.button.callback('Предварительный расчет', 'calculate'),
            Markup.button.callback('Оформить полис онлайн', 'purchase'),
        ]));
    } else if (userResponse.step === 'calculate') {
        const period = parseInt(ctx.message.text);

        if ([15, 30, 60, 90, 180].includes(period)) {
            userResponses[userId].period = period;

            // Вычисляем стоимость страховки
            let price;
            switch (period) {
                case 15:
                    price = 4000;
                    break;
                case 30:
                    price = 6500;
                    break;
                case 60:
                    price = 11000;
                    break;
                case 90:
                    price = 15000;
                    break;
                case 180:
                    price = 28000;
                    break;
            }

            userResponses[userId].price = price;

            // Отправляем стоимость страховки и клавиатуру для дальнейших действий
            await delayWithTyping(ctx, 3000); // Задержка в 3 секунды с лейблом "Бот набирает сообщение"
            await ctx.replyWithHTML(`Стоимость страховки на ${period} дней: <b>${price} руб.</b>\nВыберите действие:`, Markup.inlineKeyboard([
                Markup.button.callback('Оформить полис онлайн', 'purchase'),
                Markup.button.callback('Вернусь позже', 'cancel'),
            ]));
        } else {
            await delayWithTyping(ctx, 3000); // Задержка в 3 секунды с лейблом "Бот набирает сообщение"
            await ctx.reply('Пожалуйста, укажите корректный период страхования (15, 30, 60, 90 или 180).');
        }
    } else {
        await ctx.reply('Пожалуйста, начните с команды /start и выберите "Предварительный расчет".');
    }
});

// Обработчик события "фото"
bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    if (!userResponses[userId]) {
        // Пользователь отправил фото перед началом диалога
        await ctx.reply('Я бот, и не умею распознавать фото. Но я учусь, и скоро я буду вас понимать, а пока выбирайте то, что вам необходимо', Markup.inlineKeyboard([
            Markup.button.callback('Предварительный расчет', 'calculate'),
            Markup.button.callback('Оформить полис онлайн', 'purchase'),
        ]));
    }
});

// Обработчик события "документ"
bot.on('document', async (ctx) => {
    const userId = ctx.from.id;
    if (!userResponses[userId]) {
        // Пользователь отправил документ перед началом диалога
        await ctx.reply('Я бот, и не умею распознавать документы. Но я учусь, и скоро я буду вас понимать, а пока выбирайте то, что вам необходимо', Markup.inlineKeyboard([
            Markup.button.callback('Предварительный расчет', 'calculate'),
            Markup.button.callback('Оформить полис онлайн', 'purchase'),
        ]));
    }
});

// Обработчик события "голосовое сообщение"
bot.on('voice', async (ctx) => {
    const userId = ctx.from.id;
    if (!userResponses[userId]) {
        // Пользователь отправил голосовое сообщение перед началом диалога
        await ctx.reply('Я бот, и не умею распознавать голосовые сообщения. Но я учусь, и скоро я буду вас понимать, а пока выбирайте то, что вам необходимо', Markup.inlineKeyboard([
            Markup.button.callback('Предварительный расчет', 'calculate'),
            Markup.button.callback('Оформить полис онлайн', 'purchase'),
        ]));
    }
});

bot.on('sticker', async (ctx) => {
    const userId = ctx.from.id;
    if (!userResponses[userId]) {
        // Пользователь отправил голосовое сообщение перед началом диалога
        await ctx.reply('Я бот, и не умею распознавать стикеры. Но я учусь, и скоро я буду вас понимать, а пока выбирайте то, что вам необходимо', Markup.inlineKeyboard([
            Markup.button.callback('Предварительный расчет', 'calculate'),
            Markup.button.callback('Оформить полис онлайн', 'purchase'),
        ]));
    }
});


bot.action('calculate', async (ctx) => {
    await ctx.reply('Вы выбрали "Предварительный расчет".');
    await delayWithTyping(ctx, 3000); // Задержка в 3 секунды с лейблом "Бот набирает сообщение"
    await ctx.reply('Укажите период страхования (например, 15, 30, 60, 90 или 180).');
    userResponses[ctx.from.id] = { step: 'calculate' };
});

bot.action('purchase', async (ctx) => {
    const userId = ctx.from.id;
    const userResponse = userResponses[userId];

    if (userResponse && userResponse.step === 'calculate') {
        await delayWithTyping(ctx, 3000); // Задержка в 3 секунды с лейблом "Бот набирает сообщение"
        // Добавьте здесь логику для оформления полиса онлайн, используя информацию из userResponse
        await ctx.reply('Вы выбрали "Оформить полис онлайн".');
        // Теперь добавьте эту запись в userResponses
        userResponses[userId].step = 'purchase';
    } else {
        await ctx.reply('Вы выбрали "Оформить полис онлайн".');
    }
});

bot.action('cancel', async (ctx) => {
    await delayWithTyping(ctx, 3000); // Задержка в 3 секунды с лейблом "Бот набирает сообщение"
    const userId = ctx.from.id;
    delete userResponses[userId];
    const photoPath = './assets/img/europolis1.png';

    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Предварительный расчет', 'calculate'),
        Markup.button.callback('Оформить полис онлайн', 'purchase'),
    ]);

    await ctx.reply('Данные сброшены.');

    ctx.replyWithPhoto({ source: photoPath })
        .then(() => {
            ctx.telegram.sendMessage(ctx.chat.id, "Нажмите на одну из кнопок, чтобы сделать выбор:", keyboard);
        });
});

// Функция для создания задержки с лейблом "Бот набирает сообщение"
async function delayWithTyping(ctx, ms) {
    await ctx.replyWithChatAction('typing');
    await new Promise(resolve => setTimeout(resolve, ms));
}

// Запуск бота
bot.launch();

console.log('Бот запущен');