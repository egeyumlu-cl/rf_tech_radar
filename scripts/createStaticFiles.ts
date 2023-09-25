#!/usr/bin/env node
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { JSDOM } from "jsdom";
import XmlSitemap from "xml-sitemap";

import { publicUrl, setTitle } from "../src/config";
import { createRadar } from "./generateJson/radar";
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

const createStaticFiles = async () => {
  const items = await fetchData();
  await generateMarkdownFiles(items, 'radar');
  const radar = await createRadar();

  copyFileSync("build/index.html", "build/overview.html");
  copyFileSync("build/index.html", "build/help-and-about-tech-radar.html");
  const rawConf = readFileSync("build/config.json", "utf-8");
  const config = JSON.parse(rawConf);

  Object.keys(config.quadrants).forEach((quadrant) => {
    const destFolder = `build/${quadrant}`;
    copyFileSync("build/index.html", `${destFolder}.html`);
    if (!existsSync(destFolder)) {
      mkdirSync(destFolder);
    }
  });

  const sitemap = new XmlSitemap();
  const sitemapOptions = {
    lastmod: "now",
    changefreq: "weekly",
  };

  sitemap.add(`${publicUrl}index.html`, sitemapOptions);

  radar.items.forEach((item) => {
    const targetPath = `build/${item.quadrant}/${item.name}.html`;
    copyFileSync("build/index.html", targetPath);

    JSDOM.fromFile(targetPath).then((dom) => {
      const document = dom.window.document;
      const rootEl = document.getElementById("root");

      setTitle(document, item.title);

      if (rootEl) {
        const textNode = document.createElement("div");
        const bodyFragment = JSDOM.fragment(item.body);
        textNode.appendChild(bodyFragment);

        const headlineNode = document.createElement("h1");
        const titleText = document.createTextNode(item.title);
        headlineNode.appendChild(titleText);

        rootEl.appendChild(headlineNode);
        rootEl.appendChild(textNode);

        // remove the <noscript> element as page has already been hydrated with static content
        const noscriptEl = document.getElementsByTagName("noscript");
        if (noscriptEl[0]) {
          noscriptEl[0].remove();
        }
      } else {
        console.warn(
          'Element with ID "root" not found. Static site content will be empty.'
        );
      }

      writeFileSync(targetPath, dom.serialize());
    });

    sitemap.add(
      `${publicUrl}${item.quadrant}/${item.name}.html`,
      sitemapOptions
    );
  });

  writeFileSync("build/sitemap.xml", sitemap.xml);
};

const notion = new Client({ auth: process.env.NOTION_API_KEY });

interface FileElements {
  name: string;
  link: string | null;
  ring: string;
  quadrant: string;
}

interface TechRadarElement {
    properties: {
      Name: {
        title: [
          {
            text: {
              content: string;
              link?: string;
            };
          }
        ];
      };
      type: {
        select: {
          name: string;
        } | null;
      };
      Stage: {
        status: {
          name: string;
        };
      };
    };
  }

const fetchData = async (): Promise<FileElements[]> => {
  const items: FileElements[] = [];
  if (process.env.DATABASE_ID === undefined) return []
  const database = await notion.databases.query({ database_id: process.env.DATABASE_ID });

  for (const techRadarElement of database.results as any) {
    const isLeft = techRadarElement.properties.Name.title.length === 0;
    const isRight =
      techRadarElement.properties.type.select === null ||
      techRadarElement.properties.type.select.length === 0;

    if (isLeft || isRight) continue;

    const name = techRadarElement.properties.Name.title.at(0).text.content;
    const link = techRadarElement.properties.Name.title.at(0).text.link;
    const stage = techRadarElement.properties.Stage.status.name.toLowerCase();
    const quadrant = techRadarElement.properties.type.select.name;

    const revision = { name, link, ring: stage, quadrant };
    items.push(revision);
  }
  return items;
};

const generateMarkdownFiles = async (items: FileElements[], outputDirectory: string) => {
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  for (const item of items) {
    const markdownContent = `---
title: "${item.name}"
ring: "${item.ring}"
quadrant: "${item.quadrant}"
---
    
Text goes here. You can use **markdown** here.`;

    // Define the filename (you can use a unique identifier if needed)
    const filename = `${item.name}.md`;

    // Create the full path to the output file
    const outputPath = path.join(outputDirectory, filename);

    // Write the Markdown content to the file
    fs.writeFileSync(outputPath, markdownContent);

    console.log(`Saved ${filename} to ${outputPath}`);
  }

  console.log('Markdown files saved successfully.');
};


createStaticFiles()
  .then(() => {
    console.log(`created static files.`);
  })
  .catch((err) => {
    if (err && err.message) {
      console.error(err.message);
    }
    process.exit(1);
  });
