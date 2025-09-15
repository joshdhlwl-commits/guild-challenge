import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import fs from 'fs';

import { students, student, getMostPopularCourse, getGradesPerCourse, getCourseStatistics } from './queries';

dotenv.config({ path: `${process.cwd()}/../.env` });
const app: Express = express();
// const port = process.env.FRONTEND_PORT;
const port = process.env.FRONTEND_PORT|| 4000;

// load graphql schema
fs.readFile(`${process.cwd()}/../graphql/schema.graphql`, 'utf8', function (err, data) {
  if (err) throw err;
  const schema = buildSchema(data);

  // define graphql resolvers
  const resolvers = {
    students,
    student,
    getMostPopularCourse,
    getGradesPerCourse,
    getCourseStatistics,
  };

  // redirect base url to UI
  app.get('/', (req: Request, res: Response) => {
    res.redirect('/graphql');
  });

  // configure graphql server
  app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      rootValue: resolvers,
      graphiql: true,
    })
  );

  // start the server
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
});
