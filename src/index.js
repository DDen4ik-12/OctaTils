import {
    PROFILE_NAMES_QUERY,
    PROFILE_AVATAR_QUERY,
    COMMIT_MSG_INPUT_QUERY,
    PR_MSG_INPUT_QUERY,
} from "./vars.js";
import {
    push2RenderList,
    injectorObsvrClbk,
    reactRoots,
    renderList,
} from "./injecting.jsx";
import { renamingVisual, defaultCommitName } from "./templates.js";
import * as fiberUtils from "./lib/fiberUtils.js";
import { HtmlNodeFinder, ReactNodeFinder } from "./lib/nodeFinders.js";
import UserIdLabel from "./components/userIdLabel/userIdLabel.jsx";
import DirectoryRowIcon from "./components/directoryRowIcon/directoryRowIcon.jsx";
import TemplatesGroup from "./components/templatesGroup/templatesGroup.jsx";

/** @todo Move it to another file? */
const saveDirContentConfig = () => GM_setValue(
    "dirContent",
    dirContentConfig,
);
const dirContentConfig = GM_getValue("dirContent", []);

push2RenderList(
    UserIdLabel,
    new HtmlNodeFinder({
        parentQuery: PROFILE_NAMES_QUERY,
        addingType: "append",
    }),
    () => {
        const avatar = document.querySelector(PROFILE_AVATAR_QUERY);
        const avatarUrlRegex = /^https:\/\/avatars.githubusercontent.com\/u\/(\d+)/;
        const userId = avatar.src.match(avatarUrlRegex)[1];
        return { userId };
    }
);
push2RenderList(
    DirectoryRowIcon,
    new ReactNodeFinder({
        parentQuery: [
            { type: "component", name: "DirectoryRow" },
            { type: "cssQuery", query: "svg" },
        ],
        addingType: "set",
    }),
    (parent) => {
        const defaultD = parent.querySelector("path").getAttribute("d");
        const item = fiberUtils.parentWithProps(
            fiberUtils.of(parent),
            new Set(["item"]),
        ).memoizedProps.item;
        const config = dirContentConfig.find((configPart) => {
            if (
                configPart.nameMatch &&
                !(new RegExp(...configPart.nameMatch).test(item.name))
            ) return false;
            if (
                configPart.contentType &&
                item.contentType !== configPart.contentType
            ) return false;
            return true;
        });

        return { parent, defaultD, config };
    },
);
push2RenderList(
    TemplatesGroup,
    new ReactNodeFinder({
        parentQuery: [
            { type: "component", name: "WebCommitDialog" },
            { type: "component", name: "Dialog" },
            { type: "cssQuery", query: COMMIT_MSG_INPUT_QUERY },
        ],
        addingType: "before",
    }),
    (parent) => {
        const commitInput = parent.querySelector("#commit-message-input");
        const commitDialogNodeProps = fiberUtils.parentWithProps(
            fiberUtils.of(commitInput),
            new Set(["setMessage"]),
        ).memoizedProps;

        /** @todo Fix the reset of the new commit name in the input */
        const newCommitName = defaultCommitName(false, commitDialogNodeProps);
        commitInput.value = newCommitName;
        commitDialogNodeProps.setMessage(newCommitName);

        if (commitDialogNodeProps.isDelete) return { isDelete: true };
        const pathArr = commitDialogNodeProps.fileName.split("/");
        return {
            isDelete: false,
            isPullRequest: false,
            commitInput,
            setCommit: (newCommitName) => {
                commitInput.value = newCommitName;
                commitDialogNodeProps.setMessage(newCommitName);
            },
            optInfo: {
                file: commitDialogNodeProps.isNewFile
                    ? pathArr[pathArr.length - 1]
                    : renamingVisual(
                        commitDialogNodeProps.oldPath,
                        commitDialogNodeProps.fileName,
                    ),
            },
        };
    },
);
push2RenderList(
    TemplatesGroup,
    new ReactNodeFinder({
        parentQuery: [
            { type: "component", name: "MergeBox" },
            { type: "cssQuery", query: PR_MSG_INPUT_QUERY },
        ],
        addingType: "before",
    }),
    (parent) => {
        const commitInput = parent.querySelector("input");
        const commitInputNodeProps = fiberUtils.parentWithProps(
            fiberUtils.of(commitInput),
            new Set(["onChange", "block"]),
        ).memoizedProps;
        const mergeBoxNodeProps = fiberUtils.parentWithProps(
            fiberUtils.of(commitInput),
            new Set(["mergeRequirements"]),
        ).memoizedProps;
        const rwNodeProps = fiberUtils.parentWithProps(
            fiberUtils.of(commitInput),
            new Set(["match"]),
        ).memoizedProps;

        const newCommitName = defaultCommitName(true, mergeBoxNodeProps);
        commitInputNodeProps.onChange({
            currentTarget: { value: () => newCommitName },
        });
        commitInput.value = newCommitName;

        return {
            isDelete: false,
            isPullRequest: true,
            commitInput,
            setCommit: (newCommitName) => {
                commitInputNodeProps.onChange({
                    currentTarget: { value: () => newCommitName },
                });
                commitInput.value = newCommitName;
            },
            optInfo: {
                prNum: rwNodeProps.match.params.pr_number,
                prHead: `${mergeBoxNodeProps.pullRequest.headRepository.ownerLogin}/${mergeBoxNodeProps.pullRequest.headRefName}`,
            },
        };
    },
);

const injectorObsvr = new MutationObserver(injectorObsvrClbk);
injectorObsvr.observe(document.documentElement, { childList: true, subtree: true });
unsafeWindow.usOctatils = {
    get reactRoots() {
        return reactRoots;
    },
    get renderList() {
        return renderList;
    },
    fiberUtils,
    HtmlNodeFinder,
    ReactNodeFinder,
};