import type { NextFunction, Request, Response } from "express";

export default function Logger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(
    `New request: \n${req.method} ${req.query.senderId} ${req.query.addresserId}`
  );
  next();
}
