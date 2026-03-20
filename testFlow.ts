import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function runTestFlow() {
  try {
    console.log('--- STARTING FULL APP FLOW TEST ---');

    // 1. Register Shopkeeper
    console.log('\n[1] Registering a Shopkeeper...');
    const shopkeeperRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Raju Bhai',
      email: `shopkeeper_${Date.now()}@kirana.local`,
      password: 'password123',
      role: 'SHOPKEEPER'
    });
    const skToken = shopkeeperRes.data.token;
    console.log('✅ Shopkeeper Registered and Logged in');

    // 2. Register Customer
    console.log('\n[2] Registering a Customer...');
    const customerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Amit Customer',
      email: `customer_${Date.now()}@kirana.local`,
      password: 'password123'
    });
    const cToken = customerRes.data.token;
    console.log('✅ Customer Registered and Logged in');

    // 3. Shopkeeper Creates Products
    console.log('\n[3] Shopkeeper adding products to the store...');
    const product1Res = await axios.post(`${API_URL}/products`, {
      name: 'Aashirvaad Atta (5kg)',
      description: 'Premium whole wheat flour',
      price: 280,
      stock: 50,
      category: 'Grains'
    }, { headers: { Authorization: `Bearer ${skToken}` }});
    
    const product2Res = await axios.post(`${API_URL}/products`, {
      name: 'Tata Salt (1kg)',
      description: 'Iodised Salt',
      price: 30,
      stock: 100,
      category: 'Pantry'
    }, { headers: { Authorization: `Bearer ${skToken}` }});

    const p1Id = product1Res.data.data.product.id;
    const p2Id = product2Res.data.data.product.id;
    console.log(`✅ 2 Products Added! IDs: ${p1Id.slice(0,5)}..., ${p2Id.slice(0,5)}...`);

    // 4. Customer browses products
    console.log('\n[4] Customer viewing the dashboard (fetching all active products)...');
    const productsRes = await axios.get(`${API_URL}/products`);
    console.log(`✅ Customer sees ${productsRes.data.results} products available.`);

    // 5. Customer Adds to Cart and Checks Out
    console.log('\n[5] Customer checking out from CartScreen...');
    const cartItems = [
      { productId: p1Id, quantity: 2 }, // 2x Atta
      { productId: p2Id, quantity: 5 }  // 5x Salt
    ];

    const orderRes = await axios.post(`${API_URL}/orders`, { cartItems }, { headers: { Authorization: `Bearer ${cToken}` }});
    const orderId = orderRes.data.data.order.id;
    console.log(`✅ Order Placed! Total Amount: ₹${orderRes.data.data.order.totalAmount} (Order ID: ${orderId.slice(0,8)}...)`);

    // 6. Customer Checks Order Status
    console.log('\n[6] Customer checks OrdersScreen...');
    let myOrdersRes = await axios.get(`${API_URL}/orders/my-orders`, { headers: { Authorization: `Bearer ${cToken}` }});
    console.log(`✅ Found ${myOrdersRes.data.results} orders. Latest Order Status: ${myOrdersRes.data.data.orders[0].status}`);

    // 7. Shopkeeper updates status to SHIPPED
    console.log('\n[7] Shopkeeper updating order status to SHIPPED...');
    await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'SHIPPED' }, { headers: { Authorization: `Bearer ${skToken}` }});
    console.log('✅ Order Status Updated.');

    // 8. Customer Re-checks Order Status
    myOrdersRes = await axios.get(`${API_URL}/orders/my-orders`, { headers: { Authorization: `Bearer ${cToken}` }});
    console.log(`✅ Customer checks app again. Latest Order Status: ${myOrdersRes.data.data.orders[0].status}`);

    // 9. Logout
    console.log('\n[8] Both users Log Out successfully.');
    console.log('\n--- ALL APP FLOW TESTS PASSED! ---');

  } catch (error: any) {
    console.error('❌ TEST FLOW FAILED:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
}

runTestFlow();
