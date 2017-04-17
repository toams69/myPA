import {Request, Response}              from 'express-serve-static-core';
import {respondWithError}               from 'error/api-error';
import {StatusCode}                     from 'api/status-code';


async function proceedMessage(request: Request, response: Response): Promise<any> {
  try {
    response.json({ status: { code: StatusCode.OK }, data: { 'msg': 'processing the message' } });
  } catch (e) {
    respondWithError('proceedMessage', e, response);
  }
}

export = {
  proceedMessage: proceedMessage
};
