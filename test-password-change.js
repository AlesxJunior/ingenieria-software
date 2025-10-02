// Script de prueba para diagnosticar el cambio de contraseña
const API_BASE_URL = 'http://localhost:3001/api';

async function testPasswordChange() {
    try {
        console.log('🔐 Iniciando prueba de cambio de contraseña...');
        
        // 1. Login para obtener token
        console.log('1. Obteniendo token de autenticación...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@alexatech.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
        if (!loginData.success) {
            throw new Error('Login failed: ' + loginData.message);
        }
        
        const token = loginData.data.accessToken;
        const userId = loginData.data.user.id;
        console.log('✅ Token obtenido:', token.substring(0, 20) + '...');
        console.log('✅ User ID:', userId);
        
        // 2. Obtener lista de usuarios para encontrar el vendedor
        console.log('\n2. Obteniendo lista de usuarios...');
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const usersData = await usersResponse.json();
        console.log('Users response:', usersData);
        
        const vendedorUser = usersData.data.users.find(user => user.username === 'vendedor');
        if (!vendedorUser) {
            throw new Error('Usuario vendedor no encontrado');
        }
        
        console.log('✅ Usuario vendedor encontrado:', vendedorUser.id);
        
        // 3. Intentar cambio de contraseña
        console.log('\n3. Intentando cambio de contraseña...');
        const changePasswordResponse = await fetch(`${API_BASE_URL}/users/${vendedorUser.id}/change-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: 'NuevaPass123',
                newPassword: 'TestFrontend123'
            })
        });
        
        const changePasswordData = await changePasswordResponse.json();
        console.log('Change password response:', changePasswordData);
        
        if (changePasswordData.success) {
            console.log('✅ Contraseña cambiada exitosamente');
            
            // 4. Verificar login con nueva contraseña
            console.log('\n4. Verificando login con nueva contraseña...');
            const testLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: vendedorUser.email,
                    password: 'TestFrontend123'
                })
            });
            
            const testLoginData = await testLoginResponse.json();
            console.log('Test login response:', testLoginData);
            
            if (testLoginData.success) {
                console.log('✅ Login con nueva contraseña exitoso');
            } else {
                console.log('❌ Login con nueva contraseña falló:', testLoginData.message);
            }
        } else {
            console.log('❌ Cambio de contraseña falló:', changePasswordData.message);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

// Ejecutar la prueba
testPasswordChange();