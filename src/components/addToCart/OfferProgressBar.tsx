// components/FancyProgress.tsx
"use client";

import { useState } from "react";
import styles from "./FancyProgress.module.css";

export default function OfferProgress() {
    // value from 0 → 1
    const [value, setValue] = useState(1); // 0 = only circle, 1 = full bar

    return (
        <div className={styles.wrapper}>
            {/* visual track */}
            <div
                className={styles.progress}
                style={{ "--value": value } as React.CSSProperties}
            >
                <div className={styles.track}>
                    <div className={styles.fill} />
                </div>
                <div className={`${styles.middleCircleRing} ${value >= 0.5 ? styles.visible : ''}`} />
                <div className={`${styles.middleCircleFill} ${value >= 0.5 ? styles.visible : ''}`} />
                <div className={`${styles.rightCircle} ${value === 1 ? styles.visible : ''}`} />
            </div>
        </div>
    );
}
