import {StatusCode}           from 'api/status-code';
import {ApiResponseStatus}    from 'api/api-status';
import * as logger            from 'logger';

const log = logger.child({ from: 'api-error' });

export class ApiError {
  httpStatusCode: number;
  statusCode?:    number;
  message:        string;
  cause?:         ApiError;

  constructor (httpStatusCode?: number, message?:  string) {
    this.httpStatusCode = httpStatusCode;
    this.message        = message;
  }
  
  public static fromResponse(response: any): ApiError {
    let msg = '';
    if (response.statusCode) {
      msg = `HTTP ${response.statusCode}:`;
    } 

    try {
      let data = JSON.parse(response.body);

      if (data && data.status && data.status.message) {
        msg += ` [${data.status.message}]`;
      } else if (data && data.error_description) {
        msg += ` [${data.error_description}]`;
      } else if (data && data.message) {
        msg += ` [${data.message}]`; // CM: This isn't the API standard but useful to support since it is the spring default.
      }
      
      if (data && data.status && data.status.code) {
        msg += ` (statusCode [${data.status.code}])`;
      }

      //CM: TODO - handle any extra details that are available.

    } catch (e) {
      msg += ' <No response body>';
    }

    return new ApiError(response.statusCode, msg);
  }

  public static fromMsg(msg: string, httpStatusCode: number = 403): ApiError {
    return new ApiError(httpStatusCode, msg);
  }

  public static createWith(statusCode: number, msg: string, cause?: ApiError): ApiError {
    let error = new ApiError();
    error.statusCode  = statusCode;
    error.cause       = cause;
    error.message     = msg;
    
    return error;
  }

  public static throw(httpStatusCode: number, statusCode: number, msg: string, cause?: ApiError): ApiError {
    let error = new ApiError();
    error.httpStatusCode = httpStatusCode;
    error.statusCode     = statusCode;
    error.message        = msg;
    error.cause          = cause;    
    throw error;
  }

  public getMessage() : string {
    let msg = this.message;
    if (this.cause && this.cause instanceof ApiError) {
      msg += ' => ' + this.cause.getMessage();
    } else if (this.cause && this.cause instanceof Error && this.cause.message) {
      msg += ' => ' + this.cause.message; // CM: We don't want this to happen in general.
    }

    return msg;
  }

  public getStatusCode(): number {
    return this.statusCode;
  }

  public getHttpStatusCode(): number {
    if (this.httpStatusCode) {
      return this.httpStatusCode;
    } else if (this.cause && this.cause instanceof ApiError) {
      return this.cause.getHttpStatusCode();
    } else {
      return 403;
    }
  }
}

export function toStatus(e: any): ApiResponseStatus {
  let status: ApiResponseStatus;
  if (e instanceof ApiError) {
    status = {
      code:    e.getStatusCode(),
      message: e.getMessage()
    };
  } else {
    //CM: If we see this, it is a defect and we need to fix it.
    log.warn(`Unhandled error :`, e);
    status = {
      code: StatusCode.InternalError,
      message: 'Unhandled error'
    };
  }

  return status; 
}

function scrub(msg: string): string {
  msg = msg.replace(/ENOTFOUND.*/,    'ENOTFOUND');
  msg = msg.replace(/ECONNREFUSED.*/, 'ECONNREFUSED');

  return msg;
}

export function respondWithError(whatFailed: string, e: any, response: any): void {
  if (e instanceof ApiError) {
    let httpStatusCode = e.getHttpStatusCode();
    let statusCode     = e.getStatusCode();
    let why            = e.getMessage() || '';

    let json = {
      status: { 
        code:    statusCode,
        message: whatFailed + ' failed: ' + why
      }
    };

    // Clone and tag error on the request to be logged.
    response.apiError = JSON.parse(JSON.stringify(json.status));

    // Scrub internal details like hostnames and ports from the msg that is returned to the client
    json.status.message = scrub(json.status.message);
    response.status(httpStatusCode).json(json);   
    
  } else {
    //CM: If we see this, it is a defect and we need to fix it.
    log.warn(`${whatFailed} - Unhandled error :`, e);
    response.status(500).json({
      status: {
        code: StatusCode.InternalError,
        message: 'Operation Failed'
      }
    });
  }
}
