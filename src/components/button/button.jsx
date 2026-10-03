import classNames from "../../lib/classNames.js";

import * as styles from "./button.css";

function Button({ variant = "default", children, ...props }) {
    return (
        <div
            className={classNames(styles.button, {
                [styles.buttonDefault]: variant === "default",
                [styles.buttonPrimary]: variant === "primary",
            })}
            {...props}
        >
            <span className={styles.buttonContent}>
                <span className={styles.buttonLabel}>
                    {children}
                </span>
            </span>
        </div>
    );
}

export default Button;