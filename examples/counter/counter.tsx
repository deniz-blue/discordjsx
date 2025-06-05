import "../"
import React, { useEffect, useState } from "react";

export const Counter = () => {
    const [count, setCount] = useState(0);
    const [error, setError] = useState(false);
    const [doThrow, setDoThrow] = useState(false);

    if(doThrow) throw new Error("This error should be displayed on discord");

    // useEffect(() => {
    //     const i = setInterval(() => {
    //         setCount(c => c+1);
    //     }, 10 * 1000);
    //     return () => clearInterval(i);
    // }, []);

    return (
        <message v2 ephemeral>
            {error && (
                <button>
                    error
                </button>
            )}
            <container>
                <text>
                    Counter: **{count}**
                </text>
                <row>
                    <button
                        style="danger"
                        onClick={() => setCount(c => c - 1)}
                    >
                        -1
                    </button>
                    <button
                        style="success"
                        onClick={() => setCount(c => c + 1)}
                    >
                        +1
                    </button>
                </row>
                <row>
                    <button style="secondary">
                        No Event Handler
                    </button>
                </row>
                <row>
                    <button style="danger" onClick={() => setError(true)}>
                        Make payload invalid
                    </button>
                </row>
                <row>
                    <button style="danger" onClick={() => setDoThrow(true)}>
                        Make component throw
                    </button>
                </row>
            </container>
        </message>
    )
};
