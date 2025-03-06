//this file is used for paypal API requests and logic, https://developer.paypal.com/api/rest/


// Generate an access token: a secure identifier, allowing your app to interact with PayPal's services on behalf of a user or merchant. It grants you permissions for actions, such as creating orders, processing payments, or issuing refunds.
export async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET, PAYPAL_API_URL } = process.env; //get the keys from .env
  //format the keys to base64 ensures they are transmitted correctly over HTTP, then send them in the req headers
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString( "base64" );
  //send a POST request to the PayPal API, to generate an access token
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
  });
  //return the access token if the response is ok, else return the res error message
  return response.ok ? (await response.json()).access_token : Promise.reject(new Error(await response.text()));
}



//The paypal object, it contains the Create Order req function & Capture Payment req function
export const paypal = {
  
  createOrder: async function createOrder(price: number) {    
    const accessToken = await generateAccessToken();           //call the generateAccessToken function to get the paypal token
    //send a POST request to the PayPal API, to create an order
    const response = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ amount: { currency_code: "USD", value: price } }] }),
    });
    return response.ok ? response.json() : Promise.reject(new Error(await response.text()));  //return res/error 
  },

  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken();                 //call the generateAccessToken function to get the paypal token
    //send a POST request to the PayPal API, to capture the payment
    const response = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    return response.ok ? response.json() : Promise.reject(new Error(await response.text()));     //return res/error
  },

};
