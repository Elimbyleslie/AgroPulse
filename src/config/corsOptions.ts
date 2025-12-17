import env from './env.js';

const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Accepter les outils comme Postman, ThunderClient → origin = undefined
    if (!origin) {
      return callback(null, true);
    }

    // Vérification whitelist
    if (env.allowOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Sinon rejet
    return callback(new Error('Not allowed by CORS'));
  },

  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

export default corsOptions;
