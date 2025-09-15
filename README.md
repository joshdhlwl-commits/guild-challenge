# Guild Backend Challenge Submission

This repository contains my solution to the Guild Backend Take-Home Challenge, implementing a GraphQL API with TypeScript, Node.js, and a PostgreSQL database. The project demonstrates proficiency in data modeling, resolver design, and unit testing, fulfilling the requirements for a Senior Software Engineer role.

## Architectural & Design Decisions

### Data Modeling

The provided data schema uses `enrollments` to define courses, which can lead to data duplication and ambiguity for a `Course` entity. For this submission, I've implemented the resolvers to work with the given schema, but I would recommend a refactoring in a production environment.

**Proposed Schema Improvement:**
A dedicated `courses` table should be introduced to enforce data integrity and simplify queries.

```sql
CREATE TABLE courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar NOT NULL,
    major_id uuid REFERENCES majors(id) NULL,
    credit_hours int NOT NULL,
    tuition_cost float NOT NULL
);
```

This refactoring would allow a single, efficient database join instead of the two-step query currently used in `getMostPopularCourse`, improving both performance and data consistency.

### Resolver Implementation

The resolvers were designed with a clear separation of concerns, offloading business logic from the GraphQL layer.

  * **`getCourseStatistics`**: The calculation of mean GPA and standard deviation is performed in-application rather than in a single, complex SQL query. This approach prioritizes **readability and maintainability** over raw database performance, as the in-app logic is easier to debug and extend. For larger datasets, this could be optimized by using a database function or a more efficient SQL query to perform the calculations.

  * **`getMostPopularCourse`**: The implementation handles the lack of a dedicated `courses` table by using a two-step query: first, an aggregate query to find the most popular `course_name`, and second, a query to retrieve an example `enrollment` to satisfy the `Course` type's fields. This demonstrates a pragmatic approach to working with an imperfect schema.

-----

## Technical Stack

  * **Backend**: TypeScript, Node.js
  * **Framework**: `express`, `express-graphql`
  * **Database**: PostgreSQL via Docker
  * **Testing**: Mocha, Chai, Sinon

-----

## Getting Started

### Prerequisites

  * Docker
  * Node.js (16.x+) and Yarn

### Setup

Run these commands from the project root to set up the database and install dependencies.

1.  **Start and seed the database**:

    ```bash
    make db-start
    make db-migrate
    make db-seed
    ```

2.  **Install dependencies**:

    ```bash
    make typescript-setup
    ```

### Running the Application

To start the GraphQL server, run:

```bash
make typescript-dev
```

The GraphQL playground will be available at `http://localhost:8000/graphql`.

-----

## Testing

Comprehensive unit tests are provided to ensure the correctness of the resolvers. They mock database interactions to test business logic in isolation.

To run the tests:

```bash
make typescript-test
```