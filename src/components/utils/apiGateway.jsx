import { base44 } from "@/api/base44Client";

const API_GATEWAY_URL = "https://wg458305ik.execute-api.us-east-2.amazonaws.com/toll";

export async function sendTollEvent(lat, lon) {
  try {
    const user = await base44.auth.me();
    
    const response = await fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.email,
        latitude: lat,
        longitude: lon
      })
    });

    if (!response.ok) {
      throw new Error(`API Gateway error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send toll event:', error);
    throw error;
  }
}