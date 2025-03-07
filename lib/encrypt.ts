//this file only for free tier vercel, because a problem with bcrypt lib size when deploy to vercel it gives error
//so we will use built-in web crypto API to hash passwords  

const encoder = new TextEncoder();
const key = new TextEncoder().encode(process.env.ENCRYPTION_KEY);    //Retrieve encryption key from .env & encode it

//function to hash password with key-based encryption
export const hash = async (plainPassword: string): Promise<string> => {
  const passwordData = encoder.encode(plainPassword);
  const cryptoKey = await crypto.subtle.importKey( 'raw', key, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign', 'verify']);
  const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, passwordData);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

//function to Compare passwords using key from env var
export const compare = async ( plainPassword: string, encryptedPassword: string): Promise<boolean> => {
  const hashedPassword = await hash(plainPassword);
  return hashedPassword === encryptedPassword;
};