import path from "path";
import { UserscriptPlugin } from "webpack-userscript";
import { fileURLToPath } from "url";

console.log(
    "Build will be stored in:",
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "build"),
);

export default {
    entry: "./src/index.js",
    output: {
        path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "build"),
        filename: "octatils.js",
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                mode: "local",
                                localIdentName: "us-octatils_[name]_[local]_[hash:base64:5]",
                                exportLocalsConvention: "camel-case-only",
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new UserscriptPlugin({
            headers: {
                name: "OctaTils",
                version: "1.3",
                author: "Den4ik-12",
                description: "Userscript for the GitHub website that add some utils",
                match: "https://github.com/*",
                connect: "simpleicons.org",
                grant: [
                    "GM_setValue",
                    "GM_getValue",
                    "GM_addValueChangeListener",
                    "GM.xmlHttpRequest",
                    "unsafeWindow",
                ],
                "run-at": "document-start",
                namespace: "http://tampermonkey.net/",
                downloadURL: "https://github.com/DDen4ik-12/OctaTils/releases/latest/download/octatils.user.js",
                updateURL: "https://github.com/DDen4ik-12/OctaTils/releases/latest/download/octatils.meta.js",
            },
        }),
    ],
};