# Employee Management Back-End

Project from assignment

## Prerequisites

- Node.js (v20.x or later)
- MySQL (v8.3 or later)

## Getting Started

1. **Setup MySQL Database**

   - Use the provided `.sql` file to create tables and populate data.

2. **Configure Environment**

   - Create an `.env` file with the following:

     ```bash
     PORT=8081
     DATABASE_URL="mysql://your_username:your_password@your_url/database_name"
     ```

   - Adjust `PORT` and `DATABASE_URL` as needed. For other databases, refer to the [Prisma documentation](https://www.prisma.io/docs/orm/overview/databases).

3. **Install Dependencies**

   ```bash
   npm install
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
