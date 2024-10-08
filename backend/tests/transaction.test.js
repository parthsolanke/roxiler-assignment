const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

describe("Transaction API Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/transactions/initialize", () => {
    it("should initialize the database with seed data", async () => {
      const res = await request(app).get("/api/transactions/initialize");
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Database initialized with seed data");
    });
  });

  describe("GET /api/transactions/list", () => {
    it("should return a paginated list of transactions", async () => {
      const res = await request(app).get("/api/transactions/list?page=1&perPage=5&month=07");
      
      expect(res.statusCode).toEqual(200);
      
      expect(res.body.pagination).toHaveProperty("currentPage");
      expect(res.body.pagination).toHaveProperty("perPage");
      expect(res.body.pagination).toHaveProperty("totalPages");
      expect(res.body.pagination).toHaveProperty("totalRecords");
  
      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.perPage).toBe(5);
    });
  
    it("should return search results based on product title", async () => {
      const res = await request(app).get("/api/transactions/list?search=Mens&month=10");
  
      expect(res.statusCode).toEqual(200);
  
      expect(res.body.data.length).toBeGreaterThan(0);

      res.body.data.forEach((transaction) => {
        expect(transaction.title).toMatch(/Mens/i);
      });
    });
  
    it("should return search results across title, description, and price", async () => {
      const res = await request(app).get("/api/transactions/list?search=329.85");
  
      expect(res.statusCode).toEqual(200);
  
      expect(res.body.data.length).toBeGreaterThan(0);
  
      res.body.data.forEach((transaction) => {
        expect(transaction.price).toBe(329.85);
      });
    });
  
    it("should handle pagination and return the correct number of transactions", async () => {
      const res = await request(app).get("/api/transactions/list?page=2&perPage=3");
  
      expect(res.statusCode).toEqual(200);

      expect(res.body.pagination).toHaveProperty("currentPage");
      expect(res.body.pagination).toHaveProperty("perPage");
      expect(res.body.pagination).toHaveProperty("totalPages");
      expect(res.body.pagination).toHaveProperty("totalRecords");
  
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
    });
  
    it("should return transactions for a specific month", async () => {
      const res = await request(app).get("/api/transactions/list?month=10");
  
      expect(res.statusCode).toEqual(200);
  
      res.body.data.forEach((transaction) => {
        const dateOfSale = new Date(transaction.dateOfSale);
        expect(dateOfSale.getMonth()).toBe(9);
      });
    });
  
    it("should return an empty list if no transactions match the search", async () => {
      const res = await request(app).get("/api/transactions/list?search=NonExistentProduct");
  
      expect(res.statusCode).toEqual(200);

      expect(res.body.data.length).toBe(0);
    });

    it("should return an error if the month is invalid", async () => {
        const res = await request(app).get("/api/transactions/list?month=13");
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Invalid month parameter. It must be between 1 and 12.");
      });
    
      it("should return an error if page is invalid", async () => {
        const res = await request(app).get("/api/transactions/list?page=-1&perPage=5");
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Page must be a positive integer.");
      });
    
      it("should return an error if perPage is invalid", async () => {
        const res = await request(app).get("/api/transactions/list?page=1&perPage=0");
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Per Page must be a positive integer.");
      });
    
      it("should return an error if the search parameter is not valid", async () => {
        const res = await request(app).get("/api/transactions/list?search=<>");
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(0);
      });
  });

  describe("GET /api/transactions/statistics", () => {
    it("should return statistics for the selected month", async () => {
      const res = await request(app).get("/api/transactions/statistics?month=07");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("totalSaleAmount");
      expect(res.body).toHaveProperty("soldItems");
      expect(res.body).toHaveProperty("notSoldItems");
    });

    it("should return an error if the month is not provided", async () => {
      const res = await request(app).get("/api/transactions/statistics");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("Month parameter is required");
    });

    it("should return an error if the month is invalid", async () => {
        const res = await request(app).get("/api/transactions/statistics?month=13");
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Invalid month parameter. It must be between 1 and 12.");
      });
  });

  describe("GET /api/transactions/barchart", () => {
    it("should return bar chart data for the selected month", async () => {
      const res = await request(app).get("/api/transactions/barchart?month=07");
      console.log(res.body);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return an error if the month is not provided", async () => {
      const res = await request(app).get("/api/transactions/barchart");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("Month parameter is required");
    });

    it("should return an error if the month is invalid", async () => {
        const res = await request(app).get("/api/transactions/barchart?month=13");
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Invalid month parameter. It must be between 1 and 12.");
      });
  });

  describe("GET /api/transactions/piechart", () => {
    it("should return pie chart data for the selected month", async () => {
      const res = await request(app).get("/api/transactions/piechart?month=07");
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return an error if the month is not provided", async () => {
      const res = await request(app).get("/api/transactions/piechart");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("Month parameter is required");
    });

    it("should return an error if the month is invalid", async () => {
        const res = await request(app).get("/api/transactions/piechart?month=13");
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Invalid month parameter. It must be between 1 and 12.");
      });
  });

  describe("GET /api/transactions/combined", () => {
    it("should return combined data from all APIs", async () => {
      const res = await request(app).get("/api/transactions/combined?month=07");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("statistics");
      expect(res.body).toHaveProperty("barChart");
      expect(res.body).toHaveProperty("pieChart");
    });

    it("should return an error if the month is not provided", async () => {
      const res = await request(app).get("/api/transactions/combined");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("Month parameter is required");
    });

    it("should return an error if the month is invalid", async () => {
        const res = await request(app).get("/api/transactions/combined?month=13");
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual("Invalid month parameter. It must be between 1 and 12.");
      });
  });
});
