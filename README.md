# Library Circulation API

Project from assignment

## Prerequisites

- Node.js (v20.x or later)
- PostgreSQL (v16.4 or later)

## Diagram

## Getting Started

1. **Setup PostgreSQL Database**

   - Use the provided `.sql` file to create tables and populate data.

2. **Configure Environment**

   - Create an `.env` file with the following:

     ```bash
     PORT=8081
     DATABASE_URL="postgresql://your_username:your_password@your_url/database_name"
     JWT_TOKEN_SECRET="yourTokenSecretKey"
     JWT_REFRESH_TOKEN_SECRET="yourRefreshTokenKey"
     ACCESS_EXPIRY="30m"
     REFRESH_EXPIRY="7d"
     ```

   - Adjust all `.ENV` as needed. For other databases, refer to the [Prisma documentation](https://www.prisma.io/docs/orm/overview/databases).

3. **Install Dependencies**

   ```bash
   npm i
   ```

4. **Configure Environment**

   ```bash
   npm run pull-generate
   ```

5. **Run the Server**
   ```bash
   npm run dev
   # or
   npm run start
   ```

# API Postman

- I've put the `postman_collection` in this too you can check it!

# Enjoy!
