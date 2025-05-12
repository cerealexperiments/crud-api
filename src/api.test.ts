import request from "supertest";
import { createServer } from "http";
import { server } from "./index";

describe("API Tests", () => {
  let testServer: ReturnType<typeof createServer>;
  let createdUserId: string;

  beforeAll((done) => {
    testServer = server;
    done();
  });

  afterAll((done) => {
    testServer.close(done);
  });

  test("GET /api/users should return empty array initially", async () => {
    const response = await request(testServer).get("/api/users");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("POST /api/users should create a new user", async () => {
    const newUser = {
      username: "testuser",
      age: 18,
      hobbies: ["whatever"],
    };

    const response = await request(testServer).post("/api/users").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newUser);
    expect(response.body.id).toBeDefined();
    createdUserId = response.body.id;
  });

  test("GET /api/users/:userId should return the created user", async () => {
    const response = await request(testServer).get(
      `/api/users/${createdUserId}`
    );
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdUserId);
  });

  test("PUT /api/users/:userId should update the user", async () => {
    const updatedData = {
      username: "updateduser",
      age: 25,
      hobbies: ["cutting"],
    };

    const response = await request(testServer)
      .put(`/api/users/${createdUserId}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(updatedData.username);
  });

  test("DELETE /api/users/:userId should delete the user", async () => {
    const response = await request(testServer).delete(
      `/api/users/${createdUserId}`
    );

    expect(response.status).toBe(204);
  });

  test("GET /api/users/:userId should return 404 after deletion", async () => {
    const response = await request(testServer).get(
      `/api/users/${createdUserId}`
    );
    expect(response.status).toBe(404);
  });
});
