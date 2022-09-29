// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;

// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
//  Expiracion
// ============================
process.env.CADUCIDAD_TOKEN = "365d";

// ============================
//  SEED
// ============================
process.env.SEDD = process.env.SEDD || 'esto-es-un-token-desde-dev';

// ============================
//  EMPLOY - VALUE
// ============================
process.env.EMPLOY_VALUE = 1000;

// ============================
//  DBO
// ============================
process.env.URL_DBO = process.env.URL_DBO || 'mongodb://localhost:27017/yarikay';