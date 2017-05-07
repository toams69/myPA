import {Request, Response}    from 'express-serve-static-core';
import {respondWithError}     from 'error/api-error';
import {serviceSockets}       from 'singleton/service-sockets';
import {StatusCode}           from 'api/status-code';
import * as logger            from 'logger';

const log = logger.child({from: 'app'});
async function proceedSMS(request: Request, response: Response): Promise<any> {
  try {
    log.info('[Twilio]' + ' => ' + JSON.stringify(request.body));
    // TODO Check # before doing something
    let r = await serviceSockets.proceedRequest(request.body.Body);

    // TODO send the answert to the #
    response.json({ status: { code: StatusCode.OK }, data: { 'msg': r.answer }});
  } catch (e) {
    respondWithError('proceedSMS', e, response);
  }
}

export = {
  proceedSMS: proceedSMS
};
