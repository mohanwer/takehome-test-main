# Scale to Win Take-Home Test

## Background & Scenario

This sample app is a very simple relational organizing tool. "Relational
organizing" refers to a political organizing tactic where a campaign asks its
volunteers to talk their friends, family, and other people in their communities
organically, and then record some information about those conversations (in
contrast to more traditional canvassing, where volunteers are given a list of
specific voters/addresses to go to).

In this tool, the campaign would load up the database with a voter file. A
"voter file" is the publicly-available database of registered voters (it's
typically maintained by the Secretary of State or a local election office, and
made available to candidates, political parties, and other organizations that do
voter outreach).

The tool lets a volunteer search this voter database to locate the voter they
had a conversation with, and then record data about that conversation via
"tags". For example, the volunteer might record that a particular voter has
already voted so there's no need to do further follow-up, or that the voter
needs a ride to the polls on election day.

## Your Task

We'll be finishing up some of the basic functionality in this app. You should
spend around 5 hours on this project, but there's no strict time limit. Once
you've spent around 5 hours working through these tasks, wrap up your work and
do a brief writeup to help us understand your work: give us an overview of how
you approached the problem, any major assumptions or decisions you made, and
what your next steps would be if you were to continue to work on this project.

Then, zip up your solution and email it back to us.

You're welcome to use any tools, resources, libraries, and extensions you'd like
for this project. If you use AI while completing this task, please make a note
of what tools you used an how you used them when you email your submission to
us. This isn't to discourage use of these tools -- many of us at Scale to Win
use tools like Github Copilot -- but rather so we understand what work you're
submitting is your own, what was build with the assistance of AI, and what was
generated whole-cloth by AI.

## Part One: Tagging Backend

In `backend/src/server.ts`, you'll notice that the three endpoints for loading a
voter, adding a tag, and removing a tag aren't really implemented. You should
fill in these three endpoints so you can load up a specific voter, add a tag
(via inserting a row into the `voter_tag` table), and remove a tag (via removing
a row from the `voter_tag` table).

## Part Two: Tagging Frontend

Now, switch over to working on the frontend. You'll notice that you can perform
a search (although the search results aren't very good yet... more on that
later!) and navigate to an individual voter. But right now, the frontend doesn't
display the tags applied to that voter, or let you add/remove tags. Go ahead and
add that functionality to the frontend. You'll want to start in
`frontend/src/routes/voter.tsx`.

## Part Three: Voter Matching

Right now, the search function doesn't work very well -- it just returns the
first 100 rows from the database! Your final task is to fill in the backend
endpoint that implements the search function to actually search the database
based on the user's search input.

As you work on this, keep a few things in mind:

- We're going to be dealing with pretty messy data. The data in the voter file
  is often inaccurate or out of date -- so it's likely we'll want to perform a
  fuzzy-match and show voters that have similar but not exactly matching
  parameters.

- The volunteer might not have all the information from the search form -- for
  example, they might have a voter's first name, last initial, and ZIP code, but
  not the other information. If a partial search is performed, you should do
  your best to return the closest matches.

- You might want to extend the frontend to indicate something about how
  confident we are in a match.

- As you work on this search code, you'll be balancing performance (returning
  results quickly) and accuracy (returning both exact and partial matches, and
  reasonably prioritizing closer matches vs. fuzzier matches). In general for
  this task, accuracy is more important -- you can assume that there won't be
  more than a couple million rows in the database, so it's not unreasonable to
  look at all of them as you're searching -- although if you can figure out ways
  to speed up your matching algorithm without compromising accuracy too much,
  that's great too! In general, we're looking for a rough sketch of your
  solution in code, and then your writeup can discuss how you'd improve accuracy
  and performance, and what options you considered to balance those concerns.

# The Development Environment

We've set up a development environment for you with a backend and a frontend.
The backend is set up with NodeJS and Typescript, and the frontend is set up
with Vite, Typescript, and Material UI.

If you have a different backend language you'd prefer, feel free to discard the
provided NodeJS backend and write your backend in whatever language you'd like
(but please include instructions on how we should get it up and running). For
the frontend, please stick with the provided frontend.

The development environment includes a Postgres database, as well as a basic
schema and sample voter data (randomly generated, not real data!), which you can
find in `db-init-sql/init.sql`. This SQL file will automatically be run the
first time you spin up the database, so you should be all set to start querying
it. It's also fine if you want to make adjustments to the database schema as you
work on the backend code, just make sure that you update the `init.sql` file to
match the schema you use so that we can reproduce your work.

## Getting Set Up (Quickstart)

If you don't have a NodeJS toolchain locally, you can get started quickly by
just running everything in Docker using the provided `docker-compose.yml` file.

Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/)
installed, then just run `docker-compose up --build`. You'll be able to access
the app at `http://localhost:9098` or access the backend directly at
`http://localhost:9099`.

## Getting Set Up (Advanced)

If you've worked with Typescript before and have editor integrations and such
set up, you might prefer to run just the Postgres server in Docker, and run the
backend server and frontend development server directly on your host machine.
This has the advantage of populating `node_modules` on your host machine so
editor integrations will work more smoothly, and will also give you faster
rebuild times.

You'll need to have NodeJS 22 installed. If you use [asdf](https://asdf-vm.com/)
or [nvm](https://github.com/nvm-sh/nvm), we have provided `.tool-versions` and
`.nvmrc` files that should automatically select the correct version.

First, spin up just the Postgres server:

```bash
docker-compose up postgres
```

In a separate terminal, start up the backend development server:

```bash
cd backend
npm install
npm start
```

In a separate terminal, start up the frontend development server:

```bash
cd frontend
npm install
npm start
```

## Accessing the development Postgres server

In either setup, you can access the development Postgres server with the
following connection parameters:

- Hostname: `localhost`
- Username: `stw_takehome`
- Password: `stw_takehome`
- Database name: `stw_takehome`
- Port number: `5551`

If you don't have a Postgres client available to you, you can also run a `psql`
shell directly in the docker container:

```bash
docker-compose exec postgres psql -h localhost -U stw_takehome -d stw_takehome
```

## Resetting the development Postgres server

If you make changes to the `init.sql` file (for example, if you update the
schema), you'll need to discard the data in your Postgres database to have the
Docker environment re-run your `init.sql` file.

Stop the docker containers and remove the volume with the Postgres data:

```bash
docker-compose down -v
```

And then spin it back up. Because your Postgres database is now empty, the
Docker environment will re-run your updated `init.sql` file:

```bash
docker-compose up --build
# or docker-compose up postgres if you're just running postgres in docker as
# per the "Advanced" instructions above
```

If you make changes to the database schema, make sure to run this procedure
before sending in your solution to confirm that your database schema matches the
`init.sql` file, so we can reproduce your environment.
