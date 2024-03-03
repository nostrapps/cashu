// Functions definitions
function encodeUint8toBase64(uint8array) {
  const binaryString = uint8array.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binaryString)
}

function encodeBase64toUint8(base64String) {
  const binaryString = atob(base64String)
  const uint8Array = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i)
  }
  return uint8Array
}

function encodeJsonToBase64(jsonObj) {
  const jsonString = JSON.stringify(jsonObj)
  const uint8Array = new TextEncoder().encode(jsonString)
  return base64urlFromBase64(encodeUint8toBase64(uint8Array))
}

function encodeBase64ToJson(base64String) {
  const jsonString = new TextDecoder().decode(encodeBase64toUint8(base64urlToBase64(base64String)))
  return JSON.parse(jsonString)
}

function base64urlToBase64(str) {
  return str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=')
}

function base64urlFromBase64(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Polyfills for atob and btoa for Node.js environment
function atob(a) {
  // Check if running in Node.js
  if (typeof window === 'undefined') {
    // Node.js environment
    return Buffer.from(a, 'base64').toString('binary')
  } else {
    // Browser environment
    return window.atob(a)
  }
}

function btoa(b) {
  // Check if running in Node.js
  if (typeof window === 'undefined') {
    // Node.js environment
    return Buffer.from(b, 'binary').toString('base64')
  } else {
    // Browser environment
    return window.btoa(b)
  }
}

function getDecodedToken(token) {
  const uriPrefixes = ['urn:voucher:cashu:', 'web+cashu://', 'cashu://', 'cashu:', 'cashuA']
  uriPrefixes.forEach((prefix) => {
    if (token.startsWith(prefix)) {
      token = token.slice(prefix.length)
    }
  })
  return handleTokens(token)
}

function handleTokens(token) {
  const obj = encodeBase64ToJson(token)
  if ('token' in obj) {
    return obj
  }
  if (Array.isArray(obj)) {
    return { token: [{ proofs: obj, mint: '' }] }
  }
  return { token: [{ proofs: obj.proofs, mint: obj?.mints[0]?.url ?? '' }] }
}

export {
  encodeUint8toBase64,
  encodeBase64toUint8,
  encodeJsonToBase64,
  encodeBase64ToJson,
  base64urlToBase64,
  base64urlFromBase64,
  atob, // Note: You might not typically export these polyfills directly if adjusting for a browser environment
  btoa,
  getDecodedToken
}
