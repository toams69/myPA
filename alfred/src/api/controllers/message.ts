import {Request, Response}    from 'express-serve-static-core';
import {respondWithError}     from 'error/api-error';
import {serviceSockets}       from 'singleton/service-sockets';

async function proceedMessage(request: Request, response: Response): Promise<any> {
  try {
    // TODO use await
    const msg = request.body.msg;
    serviceSockets.proceedRequest(msg, response);
  } catch (e) {
    respondWithError('proceedMessage', e, response);
  }
}

export = {
  proceedMessage: proceedMessage
};
