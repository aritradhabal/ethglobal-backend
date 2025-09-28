import "dotenv/config";
import { CompleteGraphService } from "./complete-graph-service";
import {
  EditorState,
  UserData,
  RelationshipData,
  GetRelationships,
  Message,
} from "../types/_types";

const graphService = new CompleteGraphService();

export let state: EditorState = {
  nodes: [],
  relationships: [],
  selectedNode: null,
  selectedRelationship: null,
  queryResult: null,
  isLoading: false,
  error: null,
  stats: null,
  savedGraphInfo: null,
};
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  delay: number
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const saveGraph = async () => {
  console.log("Running save graph...");
  try {
    const result = await graphService.saveGraph({
      name: "ETHMatch",
      description: "Created by ETHMatch",
    });
    console.log("✅ Graph saved to Walrus:", result);

    state = {
      ...state,
      savedGraphInfo: {
        blobId: result.blobId,
        timestamp: new Date().toISOString(),
        name: "ETHMatch",
      },
    };
    updateState();
    return result.blobId;
  } catch (error) {
    throw new Error("❌ Error saving graph");
  }
};

const SAVE_DEBOUNCE_DELAY = 5000; // 5 seconds
const debouncedSaveGraph = debounce(saveGraph, SAVE_DEBOUNCE_DELAY);

const updateState = () => {
  const data = graphService.getAllData();
  state = {
    nodes: data.nodes,
    relationships: data.relationships,
    selectedNode: null,
    selectedRelationship: null,
    queryResult: null,
    isLoading: false,
    error: null,
    stats: graphService.getGraphStats(),
    savedGraphInfo: state.savedGraphInfo,
  };
};

export const createNode = async (UserData: UserData) => {
  try {
    const nodeProps = JSON.stringify({
      name: UserData.name,
      username: UserData.username,
      lookingFor: UserData.lookingFor,
      age: UserData.age,
      gender: UserData.gender,
      preferences: UserData.preferences,
      verified: UserData.verified,
      messages: UserData.messages,
      address: UserData.address,
      city: UserData.city,
      contact: UserData.contact,
      profilePictureId: UserData.profilePictureId,
    });

    const properties = JSON.parse(nodeProps || "{}");
    const nodeId = graphService.createNode(
      "Person",
      properties,
      [],
      UserData.address
    );
    updateState();
    debouncedSaveGraph();
    console.log(`Created node: ${nodeId}`);
  } catch (error) {
    console.error(`Failed to create node: ${error}`);
  }
};

export const createRelationship = async (
  RelationshipData: RelationshipData
) => {
  try {
    const properties = RelationshipData.properties
      ? JSON.parse(RelationshipData.properties)
      : { timestamp: Date.now() };
    const relId = graphService.createRelationship(
      RelationshipData.type,
      RelationshipData.sourceNodeId,
      RelationshipData.targetNodeId,
      properties
    );
    updateState();
    debouncedSaveGraph();
    console.log(`Created relationship: ${relId}`);
  } catch (error) {
    console.error(`Failed to create relationship: ${error}`);
  }
};

const deleteRelationship = async (relId: string) => {
  try {
    graphService.deleteRelationship(relId);
    updateState();
    debouncedSaveGraph();
    console.log(`Deleted relationship: ${relId}`);
  } catch (error) {
    console.error(`Failed to delete relationship: ${error}`);
  }
};

const loadGraph = async (lastblobId: string): Promise<void> => {
  try {
    await graphService.loadGraph(lastblobId);
    state = {
      ...state,
      savedGraphInfo: {
        blobId: lastblobId,
        timestamp: new Date().toISOString(),
        name: "ETHMatch",
      },
    };
    updateState();
    console.log("Graph loaded successfully");
  } catch (error) {
    throw new Error(`Failed to load graph: ${error}`);
  }
};

export const getOutgoingRelationships = (
  GetRelationships: GetRelationships
) => {
  const outgoingRelationships = graphService
    .getOutgoingRelationships(
      GetRelationships.sourceNodeId,
      GetRelationships.type
    )
    .map((relationship) => {
      const targetNode = graphService.getNode(relationship.targetId);
      const profilePictureId = (targetNode?.properties as any)
        ?.profilePictureId as string | undefined;
      return {
        targetId: relationship.targetId,
        timestamp: relationship.properties.timestamp,
        profilePictureId,
      };
    });
  return outgoingRelationships;
};

export const getIncomingRelationships = (
  GetRelationships: GetRelationships
) => {
  return graphService
    .getIncomingRelationships(
      GetRelationships.sourceNodeId,
      GetRelationships.type
    )
    .map((relationship) => {
      const sourceId = graphService.getNode(relationship.sourceId);
      const profilePictureId = (sourceId?.properties as any)
        ?.profilePictureId as string | undefined;
      const contact = (sourceId?.properties as any)?.contact as
        | string
        | undefined;
      return {
        sourceId: relationship.sourceId,
        timestamp: relationship.properties.timestamp,
        profilePictureId,
        contact,
      };
    });
};

export const getMatches = (address: string) => {
  const meId = `node_${address}`;

  const likedByMe = graphService.getOutgoingRelationships(meId, "like");
  const seen = new Set<string>();
  const mutuals = [];

  for (const rel of likedByMe) {
    const otherId = rel.targetId;
    if (seen.has(otherId)) continue;

    const otherLikesMe = graphService
      .getOutgoingRelationships(otherId, "like")
      .some((r) => r.targetId === meId);

    if (otherLikesMe) {
      const person = graphService.getNode(otherId);
      if (person && person.type === "Person") {
        mutuals.push(person);
        seen.add(otherId);
      }
    }
  }

  return mutuals;
};

const userData1: UserData = {
  address: "0x1",
  username: "user_1",
  lookingFor: "Male",
  verified: "Orb",
  name: "User 1",
  profilePictureId: "someblobId1",
  gender: "Female",
  preferences: ["dogs", "cats"],
  age: 25,
  city: "Berlin",
  contact: "telegram",
  messages: [
    { address: "0xdef456...", content: "Nice girl to talk to", counter: 1 },
    { address: "0xdef456...", content: "Heard some tea about her", counter: 2 },
    { address: "0xdef456...", content: "You should message her", counter: 3 },
  ],
};
const userData2: UserData = {
  address: "0x2",
  username: "user_2",
  lookingFor: "Female",
  verified: "Orb",
  name: "User 2",
  profilePictureId: "someblobId2",
  gender: "Male",
  preferences: ["dogs", "cats"],
  age: 22,
  city: "Delhi",
  contact: "telegram",
  messages: [
    { address: "0xdef456...", content: "Nice guy to talk to", counter: 1 },
    {
      address: "0xdef456...",
      content: "Be careful, he's a bit of a player",
      counter: 2,
    },
    { address: "0xdef456...", content: "You should message him", counter: 3 },
  ],
};
const userData3: UserData = {
  address: "0x3",
  username: "user_3",
  lookingFor: "Female",
  verified: "Orb",
  name: "User 3",
  profilePictureId: "someblobId3",
  gender: "Male",
  preferences: ["dogs", "cats"],
  age: 23,
  city: "Mumbai",
  contact: "telegram",
  messages: [
    { address: "0xdef456...", content: "Nice guy to talk to", counter: 1 },
    {
      address: "0xdef456...",
      content: "Be careful, he can steal your heart",
      counter: 2,
    },
    { address: "0xdef456...", content: "You should message him", counter: 3 },
  ],
};
const userData4: UserData = {
  address: "0xbcb60c70a4b3178bea91e8ad04e5ed73aa48a9c7",
  username: "user_4",
  lookingFor: "Male",
  verified: "Orb",
  name: "User 4",
  profilePictureId: "someblobId3",
  gender: "Female",
  preferences: ["dogs", "cats"],
  age: 23,
  city: "Delhi",
  contact: "telegram",
  messages: [
    { address: "0xdef456...", content: "Nice man", counter: 1 },
    {
      address: "0xdef456...",
      content: "Be careful, he can steal your heart",
      counter: 2,
    },
    { address: "0xdef456...", content: "You should message him", counter: 3 },
  ],
};

createNode(userData1);
createNode(userData2);
createNode(userData3);
// createNode(userData4);

createRelationship({
  type: "like",
  sourceNodeId: "node_0x1",
  targetNodeId: "node_0x2",
  properties: "",
});

createRelationship({
  type: "like",
  sourceNodeId: "node_0x2",
  targetNodeId: "node_0x1",
  properties: "",
});

export const getRecommendations = (address: string) => {
  const nodeId = `node_${address}`;
  const alreadyTargeted = new Set(
    graphService.getOutgoingRelationships(nodeId, "").map((r) => r.targetId)
  );
  const recommendations = state.nodes.filter(
    (node) =>
      node.type === "Person" &&
      node.id !== nodeId &&
      !alreadyTargeted.has(node.id)
  );
  return recommendations;
};
export const getNode = (address: string): boolean => {
  return graphService.getNode(`node_${address}`) !== null;
};

export const logState = () => {
  // await saveGraph();
  // await loadGraph("s5OsHcB-9Emt93_4I5qr0aqKLIWzILnz91aFw1oKfCY");
  return {
    node: state.nodes,
    relationship: state.relationships,
    // savedGraphInfo: state.savedGraphInfo,
  };
};

export const getMessagesByAddress = (address: string): Message[] => {
  const nodeId = `node_${address}`;
  const node = graphService.getNode(nodeId);

  const messages = (node?.properties as any)?.messages as Message[];
  return messages;
};

export const hasMutualRelationship = (
  addressA: string,
  addressB: string,
  type: "like" | "dislike" | "split"
): boolean => {
  const idA = `node_${addressA}`;
  const idB = `node_${addressB}`;

  const aToB = graphService
    .getOutgoingRelationships(idA, type)
    .some((r) => r.targetId === idB);

  if (!aToB) return false;

  const bToA = graphService
    .getOutgoingRelationships(idB, type)
    .some((r) => r.targetId === idA);

  return bToA;
};
