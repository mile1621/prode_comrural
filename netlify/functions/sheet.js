export async function handler(event) {
  try {
    const GAS_URL = process.env.GAS_URL

    const body = JSON.parse(event.body || '{}')

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message,
      }),
    }
  }
}