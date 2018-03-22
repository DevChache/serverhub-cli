# ServerHub-CLI

This is the CLI tool for [serverhub-mvc](https://www.npmjs.com/package/serverhub-mvc).

## About

This tool is only for generating file structure or templates for serverhub-mvc.

## Usage

Here is an example using serverhub-cli to intialize an template.

First, you need move to your workspace.

```bash
npm -i -g serverhub-cli
cd /your/workspace
```

Then use serverhub-cli to set up the template.

```bash
serverhub-cli init [project-name]
```

Bingo! The target template is successfully loaded.

```bash
cd /[project-name]
npm install
npm run dev
```

Then, ServerHub will start and listen to port 926.

## Templates

Since version 0.1.0, ServerHub updated the way of generating templates. We will list several avaliable templates in later updates.

## Contributor

Yuyang Mao