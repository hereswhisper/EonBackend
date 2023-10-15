import { RawData, Server } from "ws";
import XMLBuilder from "xmlbuilder";
import XMLParser from "xml-parser";
import { v4 as generateUUID } from "uuid";
import express from "express";
import User, { IUser } from "../database/models/User";
import { Client } from "./interfaces/Client";
import { getEnv } from "../utils";
import logger from "../utils/logger";
import { sendErrorResponse } from "../routes/oauth";

const router = express();

export const Clients: Client[] | any[] = [];
export const MUCs: any[] = [];

export default class XMPP {
  private accountId: string;
  private port: string;

  constructor() {
    this.port = getEnv("XMPP_PORT");
    this.accountId = "";

    this.init(Number(this.port));
  }

  private init(port: number): void {
    const wss = new Server({
      server: router.listen(port, () =>
        logger.log(`XMPP listening on port ${port}`, "XMPP", "cyanBright")
      ),
    });

    router.get("/clients", (req, res) => {
      res.set("Content-Type", "text/plain");

      res.status(204).send(
        JSON.stringify({
          amount: Clients.length,
          clients: Clients.map((i) => i.displayName),
        })
      );
    });

    wss.on("connection", async (ws) => {
      ws.on("close", async () => {
        const client = Clients.find((i) => i.client === ws);

        if (!client) return;

        if (!client.sender) {
          clearInterval(client.sender);
        }

        if (Clients[client.accountId]) delete Clients[client.accountId];

        if (Clients[client.accountId]) delete Clients[client.accountId];
      });

      let accountId: string = "";
      let displayName: string = "";
      let token: string = "";
      let jid: string = "";
      let resource: string | undefined = "";
      let ID = generateUUID();
      let isAuthed: boolean = false;

      ws.on("message", async (message: RawData | string) => {
        if (Buffer.isBuffer(message)) message = message.toString();

        const msg = XMLParser(message as string);

        if (!msg || !msg.root || !msg.root.name)
          return logger.error(`${ws}`, "XMPP");

        switch (msg.root.name) {
          case "open":
            ws.send(
              XMLBuilder.create("open")
                .attribute("xmlns", "urn:ietf:params:xml:ns:xmpp-framing")
                .attribute("from", "prod.ol.epicgames.com")
                .attribute("id", ID)
                .attribute("version", "1.0")
                .attribute("xml:lang", "en")
                .toString()
            );

            if (isAuthed === true) {
              ws.send(
                XMLBuilder.create("stream:features")
                  .attribute("xmlns:stream", "http://etherx.jabber.org/streams")
                  .element("ver")
                  .attribute("xmlns", "urn:xmpp:features:rosterver")
                  .up()
                  .element("starttls")
                  .attribute("xmlns", "urn:ietf:params:xml:ns:xmpp-tls")
                  .up()
                  .element("bind")
                  .attribute("xmlns", "urn:ietf:params:xml:ns:xmpp-bind")
                  .up()
                  .element("compression")
                  .attribute("xmlns", "http://jabber.org/features/compress")
                  .element("method", "zlib")
                  .up()
                  .up()
                  .element("session")
                  .attribute("xmlns", "urn:ietf:params:xml:ns:xmpp-session")
                  .up()
                  .toString()
              );
            } else {
              ws.send(
                XMLBuilder.create("stream:features")
                  .attribute("xmlns:stream", "http://etherx.jabber.org/streams")
                  .element("mechanisms")
                  .attribute("xmlns", "urn:ietf:params:xml:ns:xmpp-sasl")
                  .element("mechanism", "PLAIN")
                  .up()
                  .up()
                  .element("ver")
                  .attribute("xmlns", "urn:xmpp:features:rosterver")
                  .up()
                  .element("starttls")
                  .attribute("xmlns", "urn:ietf:params:xml:ns:xmpp-tls")
                  .up()
                  .element("compression")
                  .attribute("xmlns", "http://jabber.org/features/compress")
                  .element("method", "zlib")
                  .up()
                  .up()
                  .element("auth")
                  .attribute("xmlns", "http://jabber.org/features/iq-auth")
                  .up()
                  .toString()
              );
            }
            break;

          case "auth":
            if (!Clients.find((i) => i.client === ws) || accountId) return;
            if (!msg.root.content) return logger.error(`${ws}`, "XMPP");

            let auth = Buffer.from(msg.root.content, "base64")
              .toString()
              .split("\u0000")
              .splice(1);

            let decodedBase64 = Buffer.from(msg.root.content, "base64")
              .toString()
              .split("\u0000");

            if (!auth) {
              ws.send(
                XMLBuilder.create("failure")
                  .att("xmlns", "urn:ietf:params:xml:ns:xmpp-sasl")
                  .ele("not-authorized")
                  .up()
                  .toString()
              );
              return;
            }

            const user: IUser | null = await User.findOne({
              accountId: auth[0],
            });

            if (!user) {
              // return sendErrorResponse(response, "UserNotFound", "Failed to find User")
              return logger.error("User Not Found", "XMPP");
            }

            if (user) {
              displayName = user.username;
            }

            accountId = auth[0];
            token = auth[1];

            if (
              decodedBase64 &&
              accountId &&
              displayName &&
              token &&
              decodedBase64.length === 3
            ) {
              isAuthed = true;
              logger.log(
                `User ${displayName} has logged into eon!`,
                "XMPP",
                "cyanBright"
              );

              ws.send(
                XMLBuilder.create("success")
                  .att("xmlns", "urn:ietf:params:xml:ns:xmpp-sasl")
                  .toString()
              );
            } else {
              return logger.error(`${ws}`, "XMPP");
            }

            break;

          // Average iq of a eon member real!
          case "iq":
            console.log(msg.root.attributes);
            switch (msg.root.attributes.id) {
              case "_xmpp_bind1":
                if (
                  Clients.find((i) => i.client === ws) ||
                  resource ||
                  !accountId
                )
                  return;

                if (!msg.root.children.find((i) => i.name == "bind")) return;
                if (
                  !msg.root.children
                    .find((i) => i.name == "bind")
                    ?.children.find((i) => i.name == "resource")
                )
                  return;

                if (
                  !msg!
                    .root!.children!.find((i) => i.name == "bind")
                    ?.children.find((i) => i.name == "resource")?.content
                )
                  return;

                resource = msg.root.children
                  .find((i) => i.name === "bind")
                  ?.children.find((i) => i.name === "resource")?.content;

                jid = `${accountId}@prod.ol.epicgames.com/${resource}`;

                ws.send(
                  XMLBuilder.create("iq")
                    .attribute("to", jid)
                    .attribute("id", "_xmpp_bind1")
                    .attribute("xmlns", "jabber:client")
                    .attribute("type", "result")
                    .element("bind")
                    .attribute("xmlns", "urn:ietf:params:xml:ns:xmpp-bind")
                    .element("jid", jid)
                    .up()
                    .up()
                    .toString()
                );

                break;

              case "_xmpp_session1":
                if (Clients.find((i) => i.client === ws))
                  return logger.error(`${ws}`, "XMPP");

                let XMPPSessionXml = XMLBuilder.create("iq")
                  .attribute("to", jid)
                  .attribute("from", "prod.ol.epicgames.com")
                  .attribute("id", "_xmpp_session1")
                  .attribute("xmlns", "jabber:client")
                  .attribute("type", "result");

                ws.send(XMPPSessionXml.toString());
                // await getPresenceFromFriends(ws);
                break;

              default:
                if (!Clients.find((i) => i.client === ws))
                  return logger.error(`${ws}`, "XMPP");

                let DefaultXML = XMLBuilder.create("iq")
                  .attribute("to", jid)
                  .attribute("from", "prod.ol.epicgames.com")
                  .attribute("id", msg.root.attributes.id)
                  .attribute("xmlns", "jabber:client")
                  .attribute("type", "result");

                ws.send(DefaultXML.toString());
            }
            break;

          case "message":
            if (!Clients.find((i) => i.client === ws))
              return logger.error(`${ws}`, "XMPP");

            if (
              !msg.root.children.find((i) => i.name == "body") ||
              !msg.root.children.find((i) => i.name == "body")?.content
            )
              return;

            let messageBody = msg.root.children.find(
              (i) => i.name === "body"
            )?.content;

            switch (msg.root.attributes.type) {
              case "chat":
                if (!msg.root.attributes.to) return;

                let receiver = Clients.find(
                  (i) => i.jid.split("/")[0] === msg.root.attributes.to
                );
                let sender = Clients.find((i) => i.client === ws);

                if (!receiver || !sender) return;
                if (receiver == sender) return;

                receiver.client.send(
                  XMLBuilder.create("message")
                    .attribute("to", receiver.jid)
                    .attribute("from", sender.jid)
                    .attribute("xmlns", "jabber:client")
                    .attribute("type", "chat")
                    .element("body", messageBody)
                    .up()
                    .toString()
                );
                break;

              case "groupchat":
                // TODO
                break;

              case "presence":
                if (!Clients.find((i) => i.client === ws))
                  return logger.error(`${ws}`, "XMPP");

                // @ts-ignore
                if (msg.root.attributes.type == "unavailable") {
                  if (!msg.root.attributes.to) return;

                  if (
                    msg.root.attributes.to.endsWith(
                      "@muc.prod.ol.epicgames.com"
                    ) ||
                    msg.root.attributes.to
                      .split("/")[0]
                      .endsWith("@muc.prod.ol.epicgames.com")
                  ) {
                    if (
                      msg.root.attributes.to.toLowerCase().startsWith("party-")
                    ) {
                      let MUC = MUCs.find(
                        (i) =>
                          i.roomName === msg.root.attributes.to.split("@")[0]
                      );

                      if (!MUC) return;

                      let MUCIndex = MUCs.findIndex(
                        (i) =>
                          i.roomName === msg.root.attributes.to.split("@")[0]
                      );

                      const client = Clients.find((i) => i.client === ws);

                      if (
                        MUCs[MUCIndex].members.find(
                          (i: Client) => i.accountId === client.accountId
                        )
                      ) {
                        MUCs[MUCIndex].members.splice(
                          MUCs[MUCIndex].members.findIndex(
                            (i: Client) => i.accountId === client.accountId
                          ),
                          1
                        );
                      }

                      ws.send(
                        XMLBuilder.create("presence")
                          .attribute("to", client.jid)
                          .attribute(
                            "from",
                            getMUCmember(
                              MUCs[MUCIndex].roomName,
                              client.accountId
                            )
                          )
                          .attribute("xmlns", "jabber:client")
                          .attribute("type", "unavailable")
                          .element("x")
                          .attribute(
                            "xmlns",
                            "http://jabber.org/protocol/muc#user"
                          )
                          .element("item")
                          .attribute(
                            "nick",
                            getMUCmember(
                              MUCs[MUCIndex].roomName,
                              client.accountId
                            ).replace(
                              `${MUCs[MUCIndex].roomName}@muc.prod.ol.epicgames.com/`,
                              ""
                            )
                          )
                          .attribute("jid", client.jid)
                          .attribute("role", "none")
                          .up()
                          .element("status")
                          .attribute("code", "110")
                          .up()
                          .element("status")
                          .attribute("code", "100")
                          .up()
                          .element("status")
                          .attribute("code", "170")
                          .up()
                          .up()
                          .toString()
                      );
                      return;
                    }
                  }
                }

                if (msg.root.children.find((i) => i.name === "x")) {
                  if (
                    msg.root.children
                      .find((i) => i.name === "x")
                      ?.children.find((i) => i.name === "history")
                  ) {
                    if (!msg.root.attributes.to) return;

                    const MUC = MUCs.find(
                      (i) => i.roomName === msg.root.attributes.to.split("@")[0]
                    );

                    if (!MUC) {
                      return MUCs.push({
                        roomName: msg.root.attributes.to.split("@")[0],
                        members: [],
                      });
                    }

                    const MUCIndex = MUCs.findIndex(
                      (i) => i.roomName === msg.root.attributes.to.split("@")[0]
                    );

                    const client = Clients.find(
                      (i) => i.client === ws
                    ) as Client;
                    MUCs[MUCIndex].members.push({
                      accountId: client.accountId,
                    });

                    ws.send(
                      XMLBuilder.create("presence")
                        .attribute("to", client.jid)
                        .attribute(
                          "from",
                          getMUCmember(
                            MUCs[MUCIndex].roomName,
                            client.accountId
                          )
                        )
                        .attribute("xmlns", "jabber:client")
                        .element("x")
                        .attribute(
                          "xmlns",
                          "http://jabber.org/protocol/muc#user"
                        )
                        .element("item")
                        .attribute(
                          "nick",
                          getMUCmember(
                            MUCs[MUCIndex].roomName,
                            client.accountId
                          ).replace(
                            `${MUCs[MUCIndex].roomName}@muc.prod.ol.epicgames.com/`,
                            ""
                          )
                        )
                        .attribute("jid", client.jid)
                        .attribute("role", "participant")
                        .attribute("affiliation", "none")
                        .up()
                        .element("status")
                        .attribute("code", "110")
                        .up()
                        .element("status")
                        .attribute("code", "100")
                        .up()
                        .element("status")
                        .attribute("code", "170")
                        .up()
                        .element("status")
                        .attribute("code", "201")
                        .up()
                        .up()
                        .toString()
                    );

                    MUCs[MUCIndex].members.forEach((member: Client) => {
                      let ClientData = Clients.find(
                        (i) => i.accountId === member.accountId
                      );

                      ws.send(
                        XMLBuilder.create("presence")
                          .attribute(
                            "from",
                            getMUCmember(
                              MUCs[MUCIndex].roomName,
                              ClientData.accountId
                            )
                          )
                          .attribute("to", client.jid)
                          .attribute("xmlns", "jabber:client")
                          .element("x")
                          .attribute(
                            "xmlns",
                            "http://jabber.org/protocol/muc#user"
                          )
                          .element("item")
                          .attribute(
                            "nick",
                            getMUCmember(
                              MUCs[MUCIndex].roomName,
                              ClientData.accountId
                            ).replace(
                              `${MUCs[MUCIndex].roomName}@muc.prod.ol.epicgames.com/`,
                              ""
                            )
                          )
                          .attribute("jid", ClientData.jid)
                          .attribute("role", "participant")
                          .attribute("affiliation", "none")
                          .up()
                          .up()
                          .toString()
                      );
                    });

                    MUCs[MUCIndex].members.forEach((member: Client) => {
                      let ClientData = Clients.find(
                        (i) => i.accountId === member.accountId
                      );

                      if (!ClientData) return;

                      if (
                        client.accountId.toLowerCase() !=
                        ClientData.accountId.toLowerCase()
                      ) {
                        ClientData.client.send(
                          XMLBuilder.create("presence")
                            .attribute(
                              "from",
                              getMUCmember(
                                MUCs[MUCIndex].roomName,
                                client.accountId
                              )
                            )
                            .attribute("to", ClientData.jid)
                            .attribute("xmlns", "jabber:client")
                            .element("x")
                            .attribute(
                              "xmlns",
                              "http://jabber.org/protocol/muc#user"
                            )
                            .element("item")
                            .attribute(
                              "nick",
                              getMUCmember(
                                MUCs[MUCIndex].roomName,
                                client.accountId
                              ).replace(
                                `${MUCs[MUCIndex].roomName}@muc.prod.ol.epicgames.com/`,
                                ""
                              )
                            )
                            .attribute("jid", client.jid)
                            .attribute("role", "participant")
                            .attribute("affiliation", "none")
                            .up()
                            .up()
                            .toString()
                        );
                      }
                    });
                    return;
                  }
                }

                if (
                  !msg.root.children.find((i) => i.name === "status") ||
                  !msg.root.children.find((i) => i.name === "status")?.content
                )
                  return;

                try {
                  if (
                    !JSON.parse(
                      JSON.stringify(
                        msg.root.children.find((i) => i.name === "status")
                          ?.content
                      )
                    )
                  )
                    return;
                } catch (error) {
                  return false;
                }

                if (
                  Array.isArray(
                    JSON.parse(
                      msg.root.children.find((i) => i.name == "status")
                        ?.content as string
                    )
                  )
                )
                  return;

                let presenceBody: string | undefined = msg.root.children.find(
                  (i) => i.name === "status"
                )?.content;
                let away: boolean = false;

                if (msg.root.children.find((i) => i.name === "status"))
                  away = true;

                await updatePresenceForFriends(ws, presenceBody, away, false);
                getPresenceFromUser(accountId, accountId, false);
                break;
            }

            if (!Clients.find((i) => i.client === ws)) {
              if (
                accountId &&
                displayName &&
                token &&
                jid &&
                ID &&
                resource &&
                isAuthed == true
              ) {
                Clients.push({
                  client: ws,
                  accountId: accountId,
                  displayName: displayName,
                  token: token,
                  jid: jid,
                  resource: resource,
                  lastPresenceUpdate: {
                    away: false,
                    status: "{}",
                  },
                });
              }
            }
        }
      });
    });
  }
}

export function getPresenceFromUser(
  fromId: string,
  toId: string,
  unavailable: boolean
) {
  if (!Clients) return;

  const senderData = Clients.find((i) => i.accountId === fromId);
  const clientData = Clients.find((i) => i.accountId === toId);

  let availability = unavailable == true ? "unavailable" : "available";

  if (!senderData || !clientData) return;

  let xml = XMLBuilder.create("presence")
    .attribute("to", clientData.jid)
    .attribute("xmlns", "jabber:client")
    .attribute("from", senderData.jid);

  if (senderData.lastPresenceUpdate.away === true)
    xml = xml
      .attribute("type", availability)
      .element("show", "away")
      .up()
      .element("status", senderData.lastPresenceUpdate.status)
      .up();
  else
    xml = xml
      .attribute("type", availability)
      .element("status", senderData.lastPresenceUpdate.status)
      .up();

  clientData.client.send(xml.toString());
}

export async function updatePresenceForFriends(
  ws: any,
  body: string | undefined,
  away: boolean,
  offline: boolean
): Promise<void> {
  let senderData = Clients.find((i) => i.client === ws);

  if (!senderData) return;

  let senderIndex = Clients.findIndex((i) => i.client === ws);

  Clients[senderIndex].lastPresenceUpdate.away = away;
  Clients[senderIndex].lastPresenceUpdate.status = body;

  var friends = await User.findOne({ accountId: senderData.accountId });

  if (!friends) {
    return logger.error("User not Found", "XMPP");
  }

  let accepted = friends.friends.accepted.default;
  accepted.forEach((friend: any) => {
    var clientData = Clients.find((i) => i.accountId == friend.accountId);
    if (!clientData) return;

    var xml = XMLBuilder.create("presence")
      .attribute("to", clientData.jid)
      .attribute("xmlns", "jabber:client")
      .attribute("from", senderData.jid);

    if (offline == true) xml = xml.attribute("type", "unavailable");
    else xml = xml.attribute("type", "available");

    if (away == true)
      xml = xml.element("show", "away").up().element("status", body).up();
    else xml = xml.element("status", body).up();

    clientData.client.send(xml.toString());
  });
}

export function getMUCmember(
  roomName: string | undefined,
  accountId: string
): string {
  let client = Clients.find((i) => i.accountId == accountId);
  if (!client) return `${roomName}@muc.prod.ol.epicgames.com`;

  return `${roomName}@muc.prod.ol.epicgames.com/${encodeURI(
    client.displayName
  )}:${client.accountId}:${client.resource}`;
}

export function sendXmppMessageToId(
  body: string | undefined,
  toAccountId: string
): void {
  if (!Clients) return;
  if (typeof body == "object") body = JSON.stringify(body);

  var receiver = Clients.find((i) => i.accountId == toAccountId);
  if (!receiver) return;

  receiver.client.send(
    XMLBuilder.create("message")
      .attribute("from", "xmpp-admin@prod.ol.epicgames.com")
      .attribute("to", receiver.jid)
      .attribute("xmlns", "jabber:client")
      .element("body", body)
      .up()
      .toString()
  );
}
