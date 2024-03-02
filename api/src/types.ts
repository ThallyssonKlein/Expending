import { NextFunction, Request, Response, RequestHandler } from "express";
import { ParamsDictionary } from 'express-serve-static-core';

export interface RequestWithToken extends Request<ParamsDictionary> {
    token: string;
}
  
export type RequestHandlerWithToken = RequestHandler & ((req: RequestWithToken, res: Response, next: NextFunction) => void);