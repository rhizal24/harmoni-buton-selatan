import type { NextFunction, Request, Response } from "express";

type AsyncRouteHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

// Wraps an async handler so thrown/rejected errors reach the error middleware.
export function asyncHandler<Req extends Request = Request>(handler: AsyncRouteHandler<Req>) {
  return (req: Req, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
