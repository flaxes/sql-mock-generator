# SQL Mock data generator

Simple project for generation of mock data on any database structure  
You don't need any clarification for your database - simply input your db's credentials and run this CLI utility


## Fast start

0. Copy-paste and rename `config_example.json` to `config.json`. And place your db's credentials
1. Run `npm install` (in root of project)
2. Run `node ./ 10` - to generate 10 rows for every table (in root of project)
3. Import `result_<DATABASE>.sql` (in results folder) to your db.
4. Done.

## Requirements

-   NodeJS version 14+
-   Installed dependencies (clarification for python users)
-   Knowledge Working terminal (it's CLI utility)

## Installation

-   Install dependencies via `npm install` command in root of project

## Configuration

Copy-paste `config_example.json`, name it `config.json`.  
Provide credentials to desired database  
_Optional_. Edit chances of generation

## Run / CLI

Simple run `node ./` in root of project

> This procedure will generate mock-settings.json at the root of the project  
> where you can adjust the number of rows you want to create with simple data

Edit `mock-settings.json` and run again. Or simple provide number of rows for all tables via 3rd argument.

> i.g. `node ./ 10` - will generate 10 rows for every table

## Output

Check root folder after running CLI  
There are 2 files created inside of *results* folder. `result_<DATABASE>.json` with JSON presentation  
And `result_<DATABASE>.sql` with SQL presentation that you can use for your database

## Deep config

You can edit `column-preset.js` in custom folder and name it `column-preset-custom.js` for your desired values for any columns.  
This project uses `faker.js` for generating mock data

## CONTRIBUTION

Feel free to make pull requests
