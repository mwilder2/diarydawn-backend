# Diary Dawn Backend

This is the backend service for Diary Dawn, a personal diary platform. Built with Nest.js, it provides the API and business logic that powers the Diary Dawn application. This backend integrates with PostgreSQL for data storage, Redis for caching and messaging, and Docker for containerized deployment.

## Features
- RESTful API endpoints for managing users, diary entries, and other resources
- Integration with PostgreSQL via TypeORM
- Redis for caching and messaging
- Scalable, containerized deployment using Docker

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Nest CLI](https://docs.nestjs.com/cli/overview) (globally installed)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

## Getting Started

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/mwilder2/diarydawn-backend
   cd diarydawn-backend

2. install dependencies:
npm install

Configuration
1. Create a .env file in the root directory and configure the environment variables. Example:
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=diary_dawn
REDIS_HOST=localhost
REDIS_PORT=6379

2. Ensure that your PostgreSQL and Redis instances are running locally or via Docker.

Running Locally
1. Start the application:

npm run start
The server will run at http://localhost:3000/ by default.

2. Alternatively, use the development mode:

npm run start:dev

Docker Support
To run the backend using Docker:
1. Build the Docker containers:

docker-compose build

2. Start the containers:

docker-compose up
The API will be accessible at http://localhost:3000/.

Database Migrations
This project uses TypeORM for database interactions. To run migrations:


npm run typeorm migration:run
Testing
To run tests:


npm run test
About the Author
Diary Dawn's backend was developed by Matthew Ray Wilder, combining a passion for technology with a commitment to personal growth and self-reflection.

License
This project is licensed under the MIT License.

Contact
For more information or questions, please feel free to reach out via the Diary Dawn platform or directly through the contact details provided.

## Design
- [UML Class Diagram](./docs/uml-class-diagram.drawio)
