import { useState } from "preact/hooks";
import {
    CommitTemplate,
    saveTemplates,
    varTypes,
    templates,
} from "../../templates.js";
import Button from "../button/button.jsx";
import TemplateButton from "../templateButton/templateButton.jsx";

import * as styles from "./templatesGroup.css";

function TemplatesGroup({
    parent,
    isDelete,
    isPullRequest,
    commitInput,
    setCommit,
    optInfo,
}) {
    const [thisTemplates, setThisTemplates] = useState([...templates]);

    const handleCreateTemplate = () => {
        const emoji = prompt("New template: Emoji", "⬆");
        const name = prompt("New template: Name", "Update");
        const msg = prompt("New template: Message", "$: $ Update");

        const varsCount = msg.match(/\$/g).length;
        let vars = [];
        for (let i = 0; i < varsCount; i++) {
            const varProps = {};
            varProps.type = prompt(`New template - Var #${i + 1}/${varsCount}: Type (available: ${Object.keys(varTypes).join(", ")})`);
            varTypes[varProps.type].onCreateVar?.(`New template - Var #${i + 1}/${varsCount}`, varProps);
            vars.push(varProps);
        }

        const newTemplate = new CommitTemplate({ isPullRequest, emoji, name, msg, vars });
        templates.push(newTemplate);
        saveTemplates();
        setThisTemplates([...templates]);
    };

    return isDelete ? null : (
        <div className={styles.templatesGroup}>
            {thisTemplates
                .filter((template) => template.isPullRequest === isPullRequest)
                .map((template) => (
                    <TemplateButton
                        template={template}
                        commitInput={commitInput}
                        setCommit={setCommit}
                        setThisTemplates={setThisTemplates}
                        optInfo={optInfo}
                    />
                ))}
            <Button
                variant="primary"
                onClick={handleCreateTemplate}
            >+</Button>
        </div>
    );
}

export default TemplatesGroup;