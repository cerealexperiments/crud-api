import { createServer, IncomingMessage, ServerResponse } from "http";
import { v4 as uuidv4 } from "uuid";
import { User } from "./types";
import * as dotenv from "dotenv";

dotenv.config();

const users: User[] = [];

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;

  if (url === "/api/users" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } else if (url?.startsWith("/api/users/") && method === "GET") {
    const userId = url.split("/")[3];
    const user = users.find((user) => user.id === userId);

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    }
  } else if (url === "/api/users" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        const newUser = JSON.parse(body) as Omit<User, "id">;

        if (!newUser.username || !newUser.age || !newUser.hobbies) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required fields" }));
          return;
        }

        const user: User = {
          id: uuidv4(),
          username: newUser.username,
          age: newUser.age,
          hobbies: newUser.hobbies || [],
        };

        users.push(user);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(user));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (url?.startsWith("/api/users/") && method === "PUT") {
    const userId = url.split("/")[3];
    let body = "";

    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        const userIndex = users.findIndex((user) => user.id === userId);

        if (userIndex === -1) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User not found" }));
          return;
        }

        const updatedData = JSON.parse(body) as Partial<Omit<User, "id">>;

        if (!updatedData.username || !updatedData.age || !updatedData.hobbies) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required fields" }));
          return;
        }

        const updatedUser: User = {
          id: userId,
          username: updatedData.username,
          age: updatedData.age,
          hobbies: updatedData.hobbies || [],
        };

        users[userIndex] = updatedUser;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(updatedUser));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (url?.startsWith("/api/users/") && method === "DELETE") {
    const userId = url.split("/")[3];
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
    } else {
      users.splice(userIndex, 1);
      res.writeHead(204);
      res.end();
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
