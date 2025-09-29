const https = require('https');

// Test payment endpoint with valid user token
async function testPaymentEndpoint() {
    console.log('🧪 Testing Production Payment Endpoint...\n');

    // First, register a test user to get a valid token
    const registerData = JSON.stringify({
        firstName: 'Payment',
        lastName: 'Test',
        email: `paymenttest${Date.now()}@example.com`,
        password: 'TestPassword123!',
        phone: `98765${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        profileCreatedFor: 'Self'
    });

    const registerOptions = {
        hostname: 'matrimony-production-1a44.up.railway.app',
        port: 443,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': registerData.length
        }
    };

    try {
        // Register user
        const registerResponse = await makeRequest(registerOptions, registerData);
        console.log('✅ User Registration:', registerResponse.success ? 'Success' : 'Failed');
        
        if (!registerResponse.success) {
            console.log('❌ Registration failed:', registerResponse.message);
            return;
        }

        const token = registerResponse.token;
        console.log('🔑 Token received for payment test\n');

        // Test payment endpoint
        const paymentData = JSON.stringify({
            planType: 'Premium',
            duration: '1 month'
        });

        const paymentOptions = {
            hostname: 'matrimony-production-1a44.up.railway.app',
            port: 443,
            path: '/api/payments/create-order',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': paymentData.length
            }
        };

        const paymentResponse = await makeRequest(paymentOptions, paymentData);
        console.log('💳 Payment Endpoint Test:');
        console.log('Success:', paymentResponse.success);
        console.log('Message:', paymentResponse.message);
        
        if (paymentResponse.success) {
            console.log('✅ Payment URL received:', paymentResponse.paymentUrl ? 'Yes' : 'No');
            console.log('🔗 Payment URL:', paymentResponse.paymentUrl);
            console.log('📝 Transaction ID:', paymentResponse.transactionId);
        } else {
            console.log('❌ Payment Error:', paymentResponse.error || paymentResponse.message);
        }

    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
}

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    });
}

testPaymentEndpoint();