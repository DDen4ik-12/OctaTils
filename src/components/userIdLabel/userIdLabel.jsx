import Preact from "preact";

import * as styles from "./userIdLabel.css";

function UserIdLabel({ userId }) {
    return (
        <span
            className={styles.userIdLabel}
            title="Copy ID to clipboard"
            onClick={() => navigator.clipboard.writeText(userId)}
        >
            ID: {userId}
        </span>
    );
}

export default UserIdLabel;