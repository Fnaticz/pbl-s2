import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Finance from "../../models/finance";

describe("Finance Model", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Finance.deleteMany({});
  });

  it("Menguji dokumen tercetak dengan baik", async () => {
    const finance = await Finance.create({
      description: "Community Donation",
      amount: 500000,
      date: new Date("2025-11-01"),
    });

    expect(finance._id).toBeDefined();
    expect(finance.description).toBe("Community Donation");
    expect(finance.amount).toBe(500000);
  });

  it("should fail if required fields are missing", async () => {
    const finance = new Finance({});
    let err;
    try {
      await finance.validate();
    } catch (error: any) {
      err = error;
    }
    expect(err.errors.description).toBeDefined();
    expect(err.errors.amount).toBeDefined();
  });
});
