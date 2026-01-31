const axios = require('axios');

const baseUrl = process.argv[2] || 'http://localhost';
const concurrentUsers = parseInt(process.argv[3]) || 5;
const requestsPerUser = parseInt(process.argv[4]) || 3;

console.log(`=== Тестирование Secret Santa API ===`);
console.log(`URL: ${baseUrl}`);
console.log(`Одновременных пользователей: ${concurrentUsers}`);
console.log(`Запросов на пользователя: ${requestsPerUser}`);
console.log(`Всего операций: ${concurrentUsers * requestsPerUser}`);
console.log('');

function generateUniqueUserData(index) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return {
        email: `test_user_${index}_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123!',
        name: `TestUser${index}_${timestamp}`
    };
}

async function registerUser(userData) {
    try {
        const response = await axios.post(`${baseUrl}/api/auth/register`, {
            email: userData.email,
            password: userData.password,
            name: userData.name
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });
        
        return {
            success: true,
            data: response.data,
            status: response.status
        };
    } catch (error) {
        return {
            success: false,
            status: error.response ? error.response.status : 0,
            error: error.message
        };
    }
}

async function loginUser(userData) {
    try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
            email: userData.email,
            password: userData.password
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });
        
        return {
            success: true,
            data: response.data,
            status: response.status,
            accessToken: response.data.accessToken || null
        };
    } catch (error) {
        return {
            success: false,
            status: error.response ? error.response.status : 0,
            error: error.message
        };
    }
}

async function makeAuthenticatedRequest(userData, method, endpoint, data = null) {
    try {
        const loginResult = await loginUser(userData);
        
        if (!loginResult.success) {
            return {
                success: false,
                status: loginResult.status,
                error: `Login failed: ${loginResult.error}`
            };
        }
        
        const token = loginResult.accessToken;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
        let response;
        if (method === 'GET') {
            response = await axios.get(`${baseUrl}${endpoint}`, { headers, timeout: 15000 });
        } else if (method === 'POST') {
            response = await axios.post(`${baseUrl}${endpoint}`, data, { headers, timeout: 15000 });
        } else if (method === 'PUT') {
            response = await axios.put(`${baseUrl}${endpoint}`, data, { headers, timeout: 15000 });
        } else if (method === 'DELETE') {
            response = await axios.delete(`${baseUrl}${endpoint}`, { headers, timeout: 15000 });
        } else {
            response = await axios.get(`${baseUrl}${endpoint}`, { headers, timeout: 15000 });
        }
        
        return {
            success: true,
            data: response.data,
            status: response.status,
            dataSize: JSON.stringify(response.data).length
        };
    } catch (error) {
        return {
            success: false,
            status: error.response ? error.response.status : 0,
            error: error.message
        };
    }
}

async function simulateUserScenario(userId) {
    const userData = generateUniqueUserData(userId);
    
    const registerStartTime = Date.now();
    const registerResult = await registerUser(userData);
    const registerEndTime = Date.now();
    
    const userResults = [{
        stage: 'registration',
        success: registerResult.success,
        statusCode: registerResult.status,
        responseTime: registerEndTime - registerStartTime
    }];
    
    if (!registerResult.success) {
        return userResults;
    }
    
    for (let i = 1; i < requestsPerUser; i++) {
        const endpoints = [
            { method: 'GET', path: `/api/users/me/games?_t=${Date.now()}_${Math.random()}` },
            { method: 'GET', path: `/api/games/1?_t=${Date.now()}_${Math.random()}` },
            { 
                method: 'POST', 
                path: '/api/games', 
                data: { 
                    title: `Game_${userId}_${i}_${Date.now()}`, 
                    description: `Auto-generated game for load testing`,
                    isAdminParticipating: true,
                    startsAt: null
                }
            }
        ];
        
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        const startTime = Date.now();
        
        const requestResult = await makeAuthenticatedRequest(
            userData,
            endpoint.method,
            endpoint.path,
            endpoint.data
        );
        
        const endTime = Date.now();
        
        userResults.push({
            stage: `request_${i}`,
            success: requestResult.success,
            method: endpoint.method,
            endpoint: endpoint.path,
            statusCode: requestResult.status,
            responseTime: endTime - startTime,
            dataSize: requestResult.dataSize || 0
        });
    }
    
    return userResults;
}

async function runSimpleAuthTest() {
    const startTime = Date.now();
    
    const userPromises = [];
    for (let user = 0; user < concurrentUsers; user++) {
        userPromises.push(simulateUserScenario(user));
    }
    
    const usersResults = await Promise.all(userPromises);
    
    const totalTime = Date.now() - startTime;
    
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalOperations = 0;
    let totalResponseTime = 0;
    
    for (let i = 0; i < usersResults.length; i++) {
        const userResults = usersResults[i];
        const userSuccessful = userResults.filter(r => r.success).length;
        const userFailed = userResults.length - userSuccessful;
        const userAvgTime = userResults.reduce((sum, r) => sum + r.responseTime, 0) / userResults.length;
        
        /*console.log(`Пользователь ${i}:`);
        console.log(`  Всего операций: ${userResults.length}`);
        console.log(`  Успешных: ${userSuccessful}`);
        console.log(`  Неудачных: ${userFailed}`);
        console.log(`  Среднее время ответа: ${userAvgTime.toFixed(2)}ms`);
        console.log('');*/
        
        totalSuccessful += userSuccessful;
        totalFailed += userFailed;
        totalOperations += userResults.length;
        totalResponseTime += userResults.reduce((sum, r) => sum + r.responseTime, 0);
    }
    
    const overallSuccessRate = (totalSuccessful / totalOperations) * 100;
    const overallAvgTime = totalResponseTime / totalOperations;
    const rps = totalTime > 0 ? (totalOperations / totalTime) * 1000 : 0; // Запросов в секунду
    
    console.log('=== Общие результаты ===');
    console.log(`Всего операций: ${totalOperations}`);
    console.log(`Успешных: ${totalSuccessful}`);
    console.log(`Неудачных: ${totalFailed}`);
    console.log(`Общий успех: ${overallSuccessRate.toFixed(2)}%`);
    console.log('');
    console.log(`Общее время выполнения: ${totalTime}ms`);
    console.log(`Запросов в секунду (RPS): ${rps.toFixed(2)}`);
    console.log(`Среднее время ответа: ${overallAvgTime.toFixed(2)}ms`);
    console.log('');
    console.log('Тестируемые эндпоинты:');
    console.log('- POST /api/auth/register - регистрация пользователя');
    console.log('- POST /api/auth/login - вход пользователя');
    console.log('- GET /api/users/me/games - получение игр пользователя');
    console.log('- GET /api/games/{id} - получение конкретной игры');
    console.log('- POST /api/games - создание новой игры');
}

runSimpleAuthTest().catch(console.error);
