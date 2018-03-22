# ServerHub-CLI

This is the CLI tool for [serverhub-mvc](https://www.npmjs.com/package/serverhub-mvc).

## About

This tool is only for generating file structure or templates for serverhub-mvc.

Any detailed information about usage, please refer to `serverhub-cli -h`.

## Usage

Here is an example using serverhub-cli to intialize an template with built-in shortcut 'template'.

First, you need to create a directory and set it as working directory.

```bash
mkdir demo && cd demo
```

Then use serverhub-cli to set up the template.

```bash
serverhub-cli init template
```

Bingo! The target template is successfully loaded.

## Templates

Since version 0.1.0, ServerHub updated the way of generating templates. We will list several avaliable templates in later updates.

---
CHINESE version:

这是 ServerHub MVC 项目的命令行工具，用来生成所需的目录结构，还可以生成一个 demo。如果你需要任何的使用帮助，可以在安装后使用 `serverhub-cli -h` 命令来获取说明。

ServerHub CLI 在 0.1.0 版本之后就不再使用 `-d` 选项来修饰 `init` 参数了。但是我们提供了更多元的模板支持，详细的内容会逐步更新。