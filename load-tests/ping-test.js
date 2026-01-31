const axios = require('axios');

const baseUrl = process.argv[2] || 'http://localhost';
const concurrentUsers = parseInt(process.argv[3]) || 50;
const requestsPerUser = parseInt(process.argv[4]) || 10;

console.log(`=== Тестирование /ping (без авторизации) ===`);
console.log(`URL: ${baseUrl}/ping`);
console.log(`Одновременных пользователей: ${concurrentUsers}`);
console.log(`Запросов на пользователя: ${requestsPerUser}`);
console.log(`Всего запросов: ${concurrentUsers * requestsPerUser}`);
console.log('');

async function pingRequest() {
    const startTime = Date.now();
    try {
        const response = await axios.get(`${baseUrl}/ping`, {
            timeout: 10000,
            // Отключаем обработку cookies/sessions — не нужно
            maxRedirects: 0,
            validateStatus: () => true // принимаем любой статус
        });
        const endTime = Date.now();
        return {
            success: response.status === 200,
            statusCode: response.status,
            responseTime: endTime - startTime
        };
    } catch (error) {
        const endTime = Date.now();
        return {
            success: false,
            statusCode: error.response?.status || 0,
            responseTime: endTime - startTime,
            error: error.message
        };
    }
}

async function simulateUser(userId) {
    const results = [];
    for (let i = 0; i < requestsPerUser; i++) {
        const result = await pingRequest();
        results.push(result);
    }
    return results;
}

async function runPingTest() {
    const startTime = Date.now();

    const userPromises = [];
    for (let user = 0; user < concurrentUsers; user++) {
        userPromises.push(simulateUser(user));
    }

    const allResults = await Promise.all(userPromises);
    const totalTime = Date.now() - startTime;

    // Собираем статистику
    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalResponseTime = 0;

    for (const userResults of allResults) {
        for (const res of userResults) {
            totalRequests++;
            if (res.success) totalSuccessful++;
            totalResponseTime += res.responseTime;
        }
    }

    const successRate = (totalSuccessful / totalRequests) * 100;
    const avgResponseTime = totalResponseTime / totalRequests;
    const rps = totalRequests / (totalTime / 1000);

    console.log('=== Результаты теста /ping ===');
    console.log(`Всего запросов: ${totalRequests}`);
    console.log(`Успешных: ${totalSuccessful} (${successRate.toFixed(2)}%)`);
    console.log(`Общее время: ${totalTime}ms`);
    console.log(`RPS: ${rps.toFixed(2)}`);
    console.log(`Среднее время ответа: ${avgResponseTime.toFixed(2)}ms`);
    console.log('');
}

runPingTest().catch(console.error);
