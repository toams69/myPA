import {Request, Response}    from 'express-serve-static-core';
import {respondWithError}     from 'error/api-error';
import {serviceSockets}       from 'singleton/service-sockets';
import {StatusCode}           from 'api/status-code';
import * as logger            from 'logger';

const log = logger.child({from: 'app'});
async function proceedMessage(request: Request, response: Response): Promise<any> {
  try {
    const msg = request.body.msg;
    let r = await serviceSockets.proceedRequest(msg);
    log.info('[' + r.uuid + ']' + ' => ' + r.answer);
    response.json({ status: { code: StatusCode.OK }, data: { 'msg': r.answer }});
  } catch (e) {
    respondWithError('proceedMessage', e, response);
  }
}

export = {
  proceedMessage: proceedMessage
};
