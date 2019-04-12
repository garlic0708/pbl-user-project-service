const isProd = process.env['stage'] === 'PROD';
export const mongoUrl = `mongodb://${isProd ? 'mongo' : 'localhost'}:27017/pbl`;
export const redisUrl = isProd ? 'redis' : 'localhost';
export const cognitoPoolId = 'us-west-2_nSQkWbdyF';
