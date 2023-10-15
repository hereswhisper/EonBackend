import { Router } from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import Account, { IAccount } from "../database/models/Account";
import User, { IUser } from "../database/models/User";
import logger from "../utils/logger";
import { appendFile } from "node:fs";

interface VerificationResponse {
  token: string;
  session_id: string | JwtPayload;
  token_type: string;
  client_id: string | null;
  internal_client: boolean;
  client_service: string;
  account_id: string;
  expires_in: number;
  expires_at: string;
  auth_method: string | null;
  display_name: string | null;
  app: string;
  in_app_id: string;
  device_id: string | null;
}

interface DecodedToken extends JwtPayload {
  jti: string;
  clid: string;
  am: string;
  dvid: string;
}

export function sendErrorResponse(
  res: any,
  errorCode: string,
  message: string
): void {
  res.status(400).json({
    errorCode,
    message,
  });
}

export default function initRoute(router: Router): void {
  router.delete("/account/api/oauth/sessions/kill", (req, res) => {
    res.status(204).end();
  });

  router.delete(
    "/account/api/oauth/sessions/kill/:accessToken",
    async (req, res) => {
      try {
        const accessToken = req.params.accessToken;
        const user: IUser | null = await User.findOne({
          "accessToken.token": accessToken,
        });

        if (user) {
          // Clear user tokens: access token, client token, and refresh token
          await user.updateOne({
            accessToken: [],
            clientToken: [],
            refreshToken: [],
          });

          res.status(204).end(); // No content, successful session revocation
        } else {
          // Session not found, return an error response
          return sendErrorResponse(
            res,
            "UnknownOAuthSession",
            `Sorry we could not find the auth session '${accessToken}'`
          );
        }
      } catch {
        sendErrorResponse(
          res,
          "UnknownError",
          "An error occurred while revoking the session."
        );
      }
    }
  );

  router.post("/account/api/oauth/token", async (req, res) => {
    try {
      let grantType: any = req.body.grant_type;
      const token = req.headers["authorization"]?.split(" ")[1];
      let clientId: string = Buffer.from(token as any, "base64")
        .toString()
        .split(":")[0];
      let ip = req.headers["x-real-ip"];
      let clientToken: any = "";
      let accessToken: any = "";
      let refreshToken: any = "";
      let existingToken: any = "";

      // testing something
      console.log(`${req.query.refreshToken} || ${req.body.refreshToken}`);

      let displayName: string = req.body.username;
      let accountId: string = "";

      if (!clientId) {
        return sendErrorResponse(
          res,
          "InvalidClient",
          "Invalid or missing Authorization header. Please verify your headers."
        );
      }

      if (grantType === "password") {
        const user: IUser = await User.findOne({
          email: req.body.username,
        }).lean();

        // console.log(req.body.username);

        if (!user) {
          res.status(403).json({ error: "Failed to find user." });
          return;
        } else {
          if (bcrypt.compareSync(req.body.password, user.password)) {
            displayName = user.username;
            accountId = user.accountId;
          } else {
            return sendErrorResponse(
              res,
              "InvalidCredentials",
              "Invalid email and/or password. Please check and try again."
            );
          }
        }
      } else {
        return sendErrorResponse(
          res,
          "InvalidCredentials",
          "Invalid email and/or password. Please check and try again."
        );
      }

      if (grantType === "client_credentials") {
        if (!clientId) {
          return sendErrorResponse(res, "InvalidClientId", "Invalid Client Id");
        }

        clientToken = jwt.sign(
          {
            p: crypto.randomBytes(128).toString("base64"),
            clsvc: "fortnite",
            t: "s",
            mver: false,
            clid: clientId,
            ic: true,
            exp: Math.floor(Date.now() / 1000) + 240 * 240,
            am: "client_credentials",
            iat: Math.floor(Date.now() / 1000),
            jti: crypto.randomBytes(32).toString("hex"),
          },
          "eonfn"
        );

        return res.json({
          access_token: `eg1~${clientToken}`,
          expires_in: 28800,
          expires_at: new Date(
            new Date().getTime() + 4 * 60 * 60 * 1000
          ).toISOString(),
          token_type: "bearer",
          client_id: clientId,
          internal_client: true,
          client_service: "fortnite",
        });
      }

      existingToken = await Account.findOne({
        accessToken: { $exists: true },
        refreshToken: { $exists: true },
        clientToken: { $exists: true },
      });

      if (existingToken) {
        await existingToken.updateOne({ accessToken: [] });
        await existingToken.updateOne({ refreshToken: [] });
      }

      refreshToken = jwt.sign(
        {
          sub: accountId,
          t: "r",
          clid: clientId,
          exp: Math.floor(Date.now() / 1000) + 1920 * 1920,
          am: grantType,
          jti: crypto.randomBytes(32).toString("hex"),
        },
        "eonfn"
      );

      accessToken = jwt.sign(
        {
          app: "fortnite",
          sub: accountId,
          mver: false,
          clid: clientId,
          dn: displayName,
          am: grantType,
          p: crypto.randomBytes(256).toString("base64"),
          iai: accountId,
          clsvc: "fortnite",
          t: "s",
          ic: true,
          exp: Math.floor(Date.now() / 1000) + 480 * 480,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomBytes(32).toString("hex"),
        },
        "eonfn"
      );

      await existingToken.updateOne({
        $push: {
          accessToken: { token: `eg1~${accessToken}`, ip },
          refreshToken: { token: `eg1~${refreshToken}`, ip },
        },
      });

      return res.json({
        access_token: `eg1~${accessToken}`,
        expires_in: 28800,
        expires_at: new Date(
          new Date().getTime() + 8 * 60 * 60 * 1000
        ).toISOString(),
        token_type: "bearer",
        account_id: accountId,
        client_id: clientId,
        internal_client: true,
        client_service: "fortnite",
        refresh_token: `eg1~${refreshToken}`,
        refresh_expires: 115200,
        refresh_expires_at: new Date(
          new Date().getTime() + 32 * 60 * 60 * 1000
        ).toISOString(),
        displayName: displayName,
        app: "fortnite",
        in_app_id: accountId,
        device_id: "5dcab5dbe86a7344b061ba57cdb33c4f",
      });
    } catch {
      return res.status(400).json({
        errorCode: "errors.com.epicgames.account_token.not_found",
        message: "An error occurred. Please report this to us!",
      });
    }
  });

  router.get("/account/api/oauth/verify", (req, res) => {
    const token = req.headers["authorization"]?.split("bearer ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const accessToken = token.replace("eg1~", "");
    const decodedToken = jwt.decode(accessToken) as DecodedToken;

    const verificationResponse: VerificationResponse = {
      token,
      session_id: decodedToken?.["jti"],
      token_type: "bearer",
      client_id: decodedToken?.["clid"],
      internal_client: true,
      client_service: "fortnite",
      account_id: req.query.account_id || req.body.account_id,
      expires_in: 28800,
      expires_at: new Date(
        new Date().getTime() + 8 * 60 * 60 * 1000
      ).toISOString(),
      auth_method: decodedToken?.["am"],
      display_name: req.query.display_name || req.body.display_name,
      app: "fortnite",
      in_app_id: req.query.in_app_id || req.body.in_app_id,
      device_id: decodedToken?.["dvid"],
    };

    res.json(verificationResponse).status(200);
  });

  router.get("/account/api/oauth/exchange", async (req, res) => {
    return res.status(204).json([]);
  });
}
