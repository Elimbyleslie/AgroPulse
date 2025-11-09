
import env from './env.js';

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if ((!env.nodeProduction && !origin) || env.allowOrigins.includes(origin)) {
      callback(null, true);
    } else if (origin === '' || origin === null) {
      callback(null, false); // or callback(new Error('Origin is not allowed'))
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  };


export default corsOptions;
