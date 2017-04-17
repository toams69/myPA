import {Request, Response}              from 'express-serve-static-core';
import {respondWithError}               from 'error/api-error';
import {StatusCode}                     from 'api/status-code';

async function getUser(request: Request, response: Response): Promise<any> {
  try {
    response.json({ status: { code: StatusCode.OK }, data: {  } });
  } catch (e) {
    respondWithError('current-user', e, response);
  }
}

export const userController = {
  get: getUser
};
