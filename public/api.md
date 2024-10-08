# API Documentation

## Base URL
```
http://<host>:<PORT>/api/transactions
```

### 1. Initialize Database

#### **Endpoint**
```
GET /initialize
```

#### **Description**
Fetches JSON data from a third-party API and initializes the database with seed data.

#### **Response**
- **Status Code**: `200 OK`
- **Body**:
```json
{
  "message": "Database initialized with seed data"
}
```

#### **Error Response**
- **Status Code**: `500 Internal Server Error`
- **Body**:
```json
{
  "error": "Failed to initialize database"
}
```

---

### 2. List Transactions

#### **Endpoint**
```
GET /list
```

#### **Description**
Lists all transactions, supports search and pagination.

#### **Query Parameters**
- `month` (optional): The month to filter transactions (1-12).
- `search` (optional): Search term for filtering transactions by title, description, or price.
- `page` (optional): The page number for pagination (default: 1).
- `perPage` (optional): Number of records per page (default: 10).

#### **Response**
- **Status Code**: `200 OK`
- **Body**:
```json
{
  "data": [
    {
      "title": "Sample Product",
      "price": 99.99,
      "description": "Sample description",
      "category": "Sample Category",
      "image": "http://example.com/image.jpg",
      "sold": true,
      "dateOfSale": "2023-07-15T00:00:00Z"
    }
    // More transaction objects
  ],
  "pagination": {
    "currentPage": 1,
    "perPage": 10,
    "totalPages": 5,
    "totalRecords": 50
  }
}
```

#### **Error Response**
- **Status Code**: `500 Internal Server Error`
- **Body**:
```json
{
  "error": "Error fetching transactions"
}
```

---

### 3. Statistics

#### **Endpoint**
```
GET /statistics
```

#### **Description**
Retrieves sales statistics for a specified month.

#### **Query Parameters**
- `month`: The month to filter statistics (1-12) (required).

#### **Response**
- **Status Code**: `200 OK`
- **Body**:
```json
{
  "totalSaleAmount": 1500,
  "soldItems": 30,
  "notSoldItems": 20
}
```

#### **Error Response**
- **Status Code**: `400 Bad Request`
- **Body**:
```json
{
  "error": "Month parameter is required"
}
```
- **Status Code**: `500 Internal Server Error`
- **Body**:
```json
{
  "error": "Error fetching statistics"
}
```

---

### 4. Bar Chart Data

#### **Endpoint**
```
GET /barchart
```

#### **Description**
Retrieves data for a bar chart showing the number of items sold within specified price ranges for a given month.

#### **Query Parameters**
- `month`: The month to filter data (1-12) (required).

#### **Response**
- **Status Code**: `200 OK`
- **Body**:
```json
[
  { "priceRange": "0 - 100", "count": 10 },
  { "priceRange": "101 - 200", "count": 5 }
  // More price ranges
]
```

#### **Error Response**
- **Status Code**: `400 Bad Request`
- **Body**:
```json
{
  "error": "Month parameter is required"
}
```
- **Status Code**: `500 Internal Server Error`
- **Body**:
```json
{
  "error": "Error fetching bar chart data"
}
```

---

### 5. Pie Chart Data

#### **Endpoint**
```
GET /piechart
```

#### **Description**
Retrieves data for a pie chart showing unique categories and the number of items in each category for a specified month.

#### **Query Parameters**
- `month`: The month to filter data (1-12) (required).

#### **Response**
- **Status Code**: `200 OK`
- **Body**:
```json
[
  { "category": "Electronics", "count": 20 },
  { "category": "Clothing", "count": 15 }
  // More categories
]
```

#### **Error Response**
- **Status Code**: `400 Bad Request`
- **Body**:
```json
{
  "error": "Month parameter is required"
}
```
- **Status Code**: `500 Internal Server Error`
- **Body**:
```json
{
  "error": "Error fetching pie chart data"
}
```

---

### 6. Combined Data

#### **Endpoint**
```
GET /combined
```

#### **Description**
Fetches and combines data from statistics, bar chart, and pie chart endpoints for a specific month.

#### **Query Parameters**
- `month`: The month to filter data (1-12) (required).

#### **Response**
- **Status Code**: `200 OK`
- **Body**:
```json
{
  "statistics": {
    "totalSaleAmount": 1500,
    "soldItems": 30,
    "notSoldItems": 20
  },
  "barChart": [
    { "priceRange": "0 - 100", "count": 10 },
    { "priceRange": "101 - 200", "count": 5 }
  ],
  "pieChart": [
    { "category": "Electronics", "count": 20 },
    { "category": "Clothing", "count": 15 }
  ]
}
```

#### **Error Response**
- **Status Code**: `400 Bad Request`
- **Body**:
```json
{
  "error": "Month parameter is required"
}
```
- **Status Code**: `500 Internal Server Error`
- **Body**:
```json
{
  "error": "Error fetching combined data"
}
```