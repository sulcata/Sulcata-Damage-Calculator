"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const dependencies = require("../package.json").devDependencies;

const HASH_ALGORITHM = "sha384";

function hashOfFile(file) {
    return crypto.createHash(HASH_ALGORITHM)
                 .update(fs.readFileSync(file))
                 .digest("base64");
}

function gatherInfo(info) {
    const localFile = path.join(info.localPath, info.file);
    const filePath = path.join(__dirname, "../node_modules", localFile);
    const integrity = `${HASH_ALGORITHM}-${hashOfFile(filePath)}`;
    const version = dependencies[info.pkg];
    const src = info.tpl.replace("{pkg}", info.pkg)
                        .replace("{version}", versionNumber(version))
                        .replace("{file}", info.file);
    return {
        integrity,
        src,
        file: localFile
    };
}

function versionNumber(version) {
    if (version.startsWith("~") || version.startsWith("^")) {
        return version.slice(1);
    }
    return version;
}

const javascript = [
    {
        pkg: "vue",
        tpl: "https://cdn.jsdelivr.net/{pkg}/{version}/{file}",
        file: "vue.runtime.min.js",
        localPath: "vue/dist"
    },
    {
        pkg: "vue-i18n",
        tpl: "https://cdnjs.cloudflare.com/ajax/libs/{pkg}/{version}/{file}",
        file: "vue-i18n.min.js",
        localPath: "vue-i18n/dist"
    },
    {
        pkg: "vue-multiselect",
        tpl: "https://unpkg.com/{pkg}@{version}/dist/{file}",
        file: "vue-multiselect.min.js",
        localPath: "vue-multiselect/dist"
    }
].map(gatherInfo);

const css = [
    {
        pkg: "bootstrap",
        tpl: "https://cdn.jsdelivr.net/{pkg}/{version}/{file}",
        file: "css/bootstrap.min.css",
        localPath: "bootstrap/dist"
    },
    {
        pkg: "vue-multiselect",
        tpl: "https://unpkg.com/{pkg}@{version}/dist/{file}",
        file: "vue-multiselect.min.css",
        localPath: "vue-multiselect/dist"
    }
].map(gatherInfo);

module.exports = {
    css,
    javascript
};
