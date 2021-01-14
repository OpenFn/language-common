import nock from "nock";
import { expect } from "chai";

import { http } from "../src";

describe("post", () => {
  before(() => {
    const fakeServer = nock("https://www.example.com");

    fakeServer.post("/api/fake").reply(200, {
      httpStatus: "OK",
    });

    fakeServer
      .post("/api/fake?id=3", "stringPayload")
      .reply(200, function (uri, body) {
        return [uri, body];
      });
  });

  it("sends a post request", async () => {
    const response = await http.post({
      url: "https://www.example.com/api/fake",
    })();

    expect(Object.keys(response)).to.eql(
      ["status", "statusText", "headers", "config", "request", "data"],
      "look like an axios response"
    );

    expect(response.status).to.eql(200);
  });

  it("expands all references", async () => {
    const unresolvedValue = (state) => state.foo;
    const unresolveId = (state) => state.id;

    const initialState = { foo: "stringPayload", id: 3 };

    const response = await http.post({
      url: "https://www.example.com/api/fake",
      data: unresolvedValue,
      params: { id: unresolveId },
    })(initialState);

    expect(response.status).to.eql(200);
    expect(response.data).to.eql(["/api/fake?id=3", "stringPayload"]);
  });
});
