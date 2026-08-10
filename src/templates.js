class CommitTemplate {
    constructor({ isCore, isPullRequest, emoji, name, msg, vars, optArgs }) {
        this.isCore = !!isCore;
        this.isPullRequest = !!isPullRequest;

        this.emoji = String(emoji);
        this.name = String(name);

        this.msg = String(msg);
        this.vars = Array.isArray(vars) ? vars : [];

        Object.keys(varTypes).forEach((type) => {
            if (this.hasVarOfType(type)) varTypes[type].onConstruct?.(this, optArgs);
        });
    }
    static deserialize(value) {
        return new CommitTemplate({ ...value, isCore: false });
    }
    serialize() {
        const serialized = {
            isPullRequest: this.isPullRequest,
            emoji: this.emoji,
            name: this.name,
            msg: this.msg,
            vars: this.vars,
        };
        Object.keys(varTypes).forEach((type) => {
            if (this.vars.some((var_) => var_.type === type)) varTypes[type].onSerialize?.(this, serialized);
        });
        return serialized;
    }
    get nameWithEmoji() {
        if (this.emoji) return `${this.emoji} ${this.name}`;
        return this.name;
    }
    filledMsg(optInfo) {
        let i = -1;
        return this.msg.replaceAll("$", () => {
            i++;
            return varTypes[this.vars[i].type].fill?.({
                _var: this.vars[i],
                template: this,
                ...optInfo,
            }) || "";
        });
    }
    hasVarOfType(type) {
        return this.vars.some((var_) => var_.type === type);
    }
}

const saveTemplates = () => GM_setValue(
    "templates",
    templates.reduce((acc, template) => template.isCore ? acc : [...acc, template.serialize()], []),
);

const renamingVisual = (oldPath, newPath) => {
    const oldPathArr = oldPath.split("/");
    const newPathArr = newPath.split("/");
    if (oldPath === newPath) return newPathArr[newPathArr.length - 1];
    if (oldPathArr.length === 1 || newPathArr.length === 1) {
        return `${oldPath} => ${newPath}`;
    }
    let difI =
        newPathArr.length > oldPathArr.length
            ? oldPathArr.length - 1
            : newPathArr.findIndex((dir, i) => oldPathArr[i] !== dir);
    if (difI === -1) difI = newPathArr.length - 1;
    if (difI === 0) {
        return `${oldPathArr.toSpliced(0, difI).join("/")} => ${newPathArr.toSpliced(0, difI).join("/")}`;
    }
    return `.../${oldPathArr.toSpliced(0, difI).join("/")} => .../${newPathArr.toSpliced(0, difI).join("/")}`;
};

const defaultCommitName = (isPullRequest, props) => {
    if (isPullRequest) {
        if (
            props.pullRequest.headRefName.startsWith("dependabot") &&
            /[Bb]ump \S+ from `[a-z0-9]{7}` to `[a-z0-9]{7}`$/.test(
                props.mergeRequirements.commitMessageBody,
            )
        ) {
            const [_, module, from, to] =
                props.mergeRequirements.commitMessageBody.match(
                    /[Bb]ump (\S+) from `([a-z0-9]{7})` to `([a-z0-9]{7})`$/,
                );
            return `${module}: 📦 Bump from ${from} to ${to}`;
        }
        const prNum = props.mergeRequirements.commitMessageHeadline.match(
            /^Merge pull request #(\d+) from .+$/,
        )[1];
        return `⤴ Merge PR #${prNum} from ${props.pullRequest.headRepository.ownerLogin}/${props.pullRequest.headRefName}`;
    } else {
        if (props.isDelete) {
            const fileName = props.placeholderMessage.match(/^Delete (.+)$/)[1];
            return `${fileName}: 🗑 Delete`;
        }
        if (props.isNewFile) {
            const pathArr = props.fileName.split("/");
            const fileName = pathArr[pathArr.length - 1];
            return `${fileName}: ➕ Create`;
        }
        if (props.contentChanged) {
            return `${renamingVisual(props.oldPath, props.fileName)}: ⬆ Update`;
        }
        if (props.fileName !== props.oldPath) {
            return renamingVisual(props.oldPath, props.fileName);
        }
        return props.message;
    }
};

const varTypes = {
    text: {
        fill: ({ var_ }) => var_.text,
        onCreateVar: (titleStart, varProps) => {
            varProps.text = prompt(`${titleStart} (text): Text`) || "";
        },
    },
    file: {
        fill: ({ template, file }) => template.isPullRequest ? "" : file,
    },
    prNum: {
        fill: ({ template, prNum }) => template.isPullRequest ? prNum : "",
    },
    prHead: {
        fill: ({ template, prHead }) => template.isPullRequest ? prHead : "",
    },
    emoji: {
        fill: ({ template }) => template.emoji,
    },
    counter: {
        fill: ({ template }) => String(template.$counter || 0),
        onConstruct: (template, optArgs) => {
            if (!template.isCore) template.$counter = parseInt(optArgs?.$counter) || 0;
        },
        onSerialize: (template, serialized) => {
            if (template.$counter) serialized.$counter = template.$counter;
        },
        onUsingState: (template, state) => (state.counter = template.$counter),
        handleClick: (template, setState) => {
            template.$counter++;
            setState((state) => ({ ...state, counter: template.$counter }));
        },
        subbutton: {
            handleClick: (template, setState) => (event) => {
                event.stopPropagation();
                template.$counter = 0;
                saveTemplates();
                setState((state) => ({ ...state, counter: 0 }));
            },
            title: "Reset counter on this template",
            textContentFn: (template) => String(template.$counter),
        },
    },
};

const templates = [
    // File update core templates
    new CommitTemplate({
        isCore: true,
        emoji: "➕",
        name: "Create",
        msg: "$: $ Create",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    new CommitTemplate({
        isCore: true,
        emoji: "⬆",
        name: "Update",
        msg: "$: $ Update",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    new CommitTemplate({
        isCore: true,
        emoji: "✨",
        name: "New feature",
        msg: "$: $ Add ",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    new CommitTemplate({
        isCore: true,
        emoji: "🐛",
        name: "Bugs",
        msg: "$: $ Bugfixes",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    new CommitTemplate({
        isCore: true,
        emoji: "🔧",
        name: "Fix",
        msg: "$: $ Fix",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    new CommitTemplate({
        isCore: true,
        emoji: "🧪",
        name: "Test",
        msg: "$: $ Add test",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    new CommitTemplate({
        isCore: true,
        emoji: "🎨",
        name: "Format code",
        msg: "$: $ Format code",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    new CommitTemplate({
        isCore: true,
        emoji: "↩",
        name: "Revert",
        msg: "$: $ Revert changes",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    new CommitTemplate({
        isCore: true,
        emoji: "📄",
        name: "Docs",
        msg: "$: $ docs - ",
        vars: [{ type: "file" }, { type: "emoji" }],
    }),
    // Pull request core templates
    new CommitTemplate({
        isCore: true,
        isPullRequest: true,
        emoji: "⤴",
        name: "Pull request",
        msg: "$ Merge PR #$ from $",
        vars: [{ type: "emoji" }, { type: "prNum" }, { type: "prHead" }],
    }),
    // Non-core templates
    ...GM_getValue("templates", []).map((value) => CommitTemplate.deserialize(value)),
];

export {
    CommitTemplate,
    saveTemplates,
    renamingVisual,
    defaultCommitName,
    varTypes,
    templates,
};