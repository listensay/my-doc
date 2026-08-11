import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

function toEnglishSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeYamlString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getShanghaiDatetime() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}+08:00`;
}

const terminal = createInterface({ input, output });

try {
  const title =
    getArg("title") ?? (await terminal.question("文章中文标题："));

  if (!title.trim()) {
    throw new Error("文章标题不能为空。");
  }

  const suggestedSlug = toEnglishSlug(title);
  const slugAnswer =
    getArg("slug") ??
    (await terminal.question(
      `英文 URL slug${suggestedSlug ? `（默认 ${suggestedSlug}）` : ""}：`
    ));
  const slug = toEnglishSlug(slugAnswer || suggestedSlug);

  if (!slug) {
    throw new Error(
      "中文标题无法直接生成有意义的英文 URL，请输入例如 electrical-basics。"
    );
  }

  const category =
    getArg("category") ??
    (await terminal.question("文章分类目录（默认 Embedded）：")) ??
    "Embedded";
  const safeCategory = (category.trim() || "Embedded")
    .replaceAll("..", "")
    .replace(/^\/+|\/+$/g, "");

  const description =
    getArg("description") ?? (await terminal.question("文章简介："));
  const published = args.includes("--publish");
  const targetDirectory = resolve("src/content/posts", safeCategory);
  const targetFile = resolve(targetDirectory, `${title.trim()}.md`);

  if (existsSync(targetFile)) {
    throw new Error(`文件已存在：${targetFile}`);
  }

  const content = `---
title: "${escapeYamlString(title.trim())}"
slug: ${slug}
pubDatetime: ${getShanghaiDatetime()}
description: "${escapeYamlString(description.trim() || "文章简介")}"
featured: false
draft: ${published ? "false" : "true"}
tags:
  - others
---

# ${title.trim()}

## 前言


## 正文


## 总结

`;

  mkdirSync(targetDirectory, { recursive: true });
  writeFileSync(targetFile, content, { encoding: "utf8", flag: "wx" });

  console.log(`\n文章已创建：${targetFile}`);
  console.log(`文章 URL：/posts/${safeCategory.toLowerCase()}/${slug}/`);
  console.log(
    published
      ? "当前状态：已发布"
      : "当前状态：草稿。写完后将 draft 改为 false。"
  );
} catch (error) {
  console.error(`\n创建失败：${error.message}`);
  process.exitCode = 1;
} finally {
  terminal.close();
}
