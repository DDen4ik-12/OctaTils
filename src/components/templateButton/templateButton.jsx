import { useState } from "preact/hooks";
import { saveTemplates, varTypes, templates } from "../../templates.js";
import Button from "../button/button.jsx";

import * as styles from "./templateButton.css";

function TemplateButton({
    template,
    commitInput,
    setCommit,
    setThisTemplates,
    optInfo,
}) {
    const [state, setState] = useState(Object.keys(varTypes).reduce((newState, type) => {
        if (template.hasVarOfType(type)) varTypes[type].onUsingState?.(template, newState);
        return newState;
    }, {}));

    const handleClick = () => {
        Object.keys(varTypes).forEach((type) => {
            if (template.hasVarOfType(type)) varTypes[type].handleClick?.(template, setState);
        });
        setCommit(template.filledMsg(optInfo));
        commitInput.focus();
        saveTemplates();
    };
    const handleRemoveTemplate = (event) => {
        event.stopPropagation();
        templates.splice(templates.indexOf(template), 1);
        saveTemplates();
        setThisTemplates([...templates]);
    };

    const removeSubbutton = (
        <span
            className={styles.subbutton}
            title="Remove this template"
            onClick={handleRemoveTemplate}
        >×</span>
    );
    const subbuttonsInfo = Object.keys(varTypes).reduce((subbuttonsInfo, type) => {
        if (template.hasVarOfType(type) && varTypes[type].subbutton)
            subbuttonsInfo.push(varTypes[type].subbutton);
        return subbuttonsInfo;
    }, []);

    return (
        <Button onClick={handleClick}>
            {template.nameWithEmoji}
            {subbuttonsInfo.map((subbutton) => (
                <span
                    className={styles.subbutton}
                    title={subbutton.title}
                    onClick={subbutton.handleClick(template, setState)}
                >
                    {subbutton.textContentFn(template)}
                </span>
            ))}
            {!template.isCore && removeSubbutton}
        </Button>
    );
}

export default TemplateButton;