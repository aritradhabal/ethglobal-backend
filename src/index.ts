import express, { Request, Response } from "express";
import {
  UserData,
  RelationshipData,
  GetRelationships,
  CreateRelationshipData,
  Message,
} from "./types/_types";
import {
  state,
  createNode,
  logState,
  createRelationship,
  getOutgoingRelationships,
  getIncomingRelationships,
  getMatches,
  getRecommendations,
  getNode,
  getMessagesByAddress,
  hasMutualRelationship,
} from "./services/main";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "https://v5j7rrl9-3000.inc1.devtunnels.ms" }));

app.post("/create", (request: Request, response: Response) => {
  try {
    const userData: UserData = request.body;
    if (!userData || typeof userData !== "object") {
      response.status(400).json({ message: "Invalid user data." });
      return;
    }
    createNode(userData);
    response.status(200).json({
      message: "Node created successfully!",
    });
  } catch (error) {
    response.status(500).json({ message: "Failed to create node." });
  }
});

app.post("/create-relationship", (request: Request, response: Response) => {
  try {
    const relationshipData: CreateRelationshipData = request.body;
    createRelationship(relationshipData);
    response
      .status(200)
      .json({ message: "Relationship created successfully!" });
  } catch (error) {
    response.status(500).json({ message: "Failed to create relationship." });
  }
});

app.get("/", (request: Request, response: Response) => {
  response.status(200).json(logState());
});

app.post("/likes-sent", (request: Request, response: Response) => {
  try {
    const GetRelationships: GetRelationships = request.body;
    const outgoingRelationships = getOutgoingRelationships(GetRelationships);
    response.status(200).json({ relationships: outgoingRelationships });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Failed to get outgoing relationships." });
  }
});

app.post("/likes-received", (request: Request, response: Response) => {
  try {
    const GetRelationships: GetRelationships = request.body;
    const incomingRelationships = getIncomingRelationships(GetRelationships);
    response.status(200).json({ relationships: incomingRelationships });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Failed to get incoming relationships." });
  }
});

app.post("/get-matches", (request: Request, response: Response) => {
  try {
    const address: { address: string } = request.body;
    const match = getMatches(address.address);
    response.status(200).json({ match });
  } catch (error) {
    response.status(500).json({ message: "Failed to get match." });
  }
});

app.post("/recommend", (request: Request, response: Response) => {
  try {
    const address: { address: string } = request.body;
    const recommendations = getRecommendations(address.address);
    response.status(200).json({ recommendations });
  } catch (error) {
    response.status(500).json({ message: "Failed to get recommendations." });
  }
});

app.post("/node", (request: Request, response: Response) => {
  try {
    const address: { address: string } = request.body;
    const node = getNode(address.address);
    response.status(200).json({ node });
  } catch (error) {
    response.status(500).json({ message: "Failed to get node." });
  }
});

app.post("/get-messages", (request: Request, response: Response) => {
  try {
    const address: { address: string } = request.body;
    const messages = getMessagesByAddress(address.address);
    response.status(200).json({ messages });
  } catch (error) {
    response.status(500).json({ message: "Failed to get messages." });
  }
});

app.post("/get-mututal-type", (request: Request, response: Response) => {
  try {
    const data: {
      addressA: string;
      addressB: string;
      type: "like" | "dislike" | "split";
    } = request.body;
    const result = hasMutualRelationship(
      data.addressA,
      data.addressB,
      data.type
    );
    response.status(200).json({ result });
  } catch (error) {
    response.status(500).json({ message: "Failed to get mutual type." });
  }
});

import jwt from "jsonwebtoken";
import type { NextFunction } from "express";

export function requireNextAppAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.SERVICE_JWT_SECRET!, {
      algorithms: ["HS256"],
      issuer: "next-app",
      audience: "express",
    }) as Record<string, any>;

    (req as any).user = payload;
    console.log("success"); // contains sub, wallet, etc.
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
