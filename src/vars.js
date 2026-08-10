const RENDERED_LIST_SMBL = Symbol("octatils.renderedList");
const RENDERED_LIST_1ST_CHILD_SMBL = Symbol("octatils.renderedList1stChild");
const REACT_WRAPPER_QUERY = "#__primerPortalRoot__, react-app, react-partial";
const REACT_ROOT_QUERY =
    '[data-component="Portal"] > *, [data-target="react-app.reactRoot"], [data-target="react-partial.reactRoot"]';
const PROFILE_NAMES_QUERY = ".js-profile-editable-replace h1.vcard-names";
const PROFILE_AVATAR_QUERY = ".js-profile-editable-replace img.avatar";
const COMMIT_MSG_INPUT_QUERY = 'span[class*="WebCommitDialog-module__commitMessageInput"]';
const PR_MSG_INPUT_QUERY = '[data-testid="mergebox-border-container"] .TextInput-wrapper';

export {
    RENDERED_LIST_SMBL,
    RENDERED_LIST_1ST_CHILD_SMBL,
    REACT_WRAPPER_QUERY,
    REACT_ROOT_QUERY,
    PROFILE_NAMES_QUERY,
    PROFILE_AVATAR_QUERY,
    COMMIT_MSG_INPUT_QUERY,
    PR_MSG_INPUT_QUERY,
};