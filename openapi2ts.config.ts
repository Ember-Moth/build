import { join } from 'path';

const config = [
  {
    requestLibPath: "import request, { apiPrefix } from '~/utils/request';",
    apiPrefix: 'apiPrefix',
    // schemaPath: 'http://localhost:5173/swagger.json',
    schemaPath: join(__dirname, 'public/swagger.json'),
    serversPath: './src/services',
  },
];

export default config;
