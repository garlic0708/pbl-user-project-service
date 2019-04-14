const isProd = process.env['PROD'] === 'true';
export const mongoUrl = `mongodb://${isProd ? process.env['MONGODB_URL'] : 'localhost'}:27017/pbl`;
export const redisUrl = isProd ? process.env['REDIS_URL'] : 'localhost';
export const cognitoPoolId = 'us-west-2_nSQkWbdyF';
