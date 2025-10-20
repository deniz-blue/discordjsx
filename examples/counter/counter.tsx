import { useEffect, useState } from "react";
import { useInstance } from "../../src/core/context.js";
import { djsx, useModal } from "../../src/index.js";
import { ModalSubmitInteraction } from "discord.js";

// @jsxRuntime automatic

export const Counter = () => {
    const { instanceId } = useInstance();
    const openModal = useModal();

    const [count, setCount] = useState(0);
    const [error, setError] = useState(false);
    const [doThrow, setDoThrow] = useState(false);

    if (doThrow) throw new Error("This error should be displayed on discord");


    return (
        <message ephemeral>
            {error && (
                <button>
                    error
                </button>
            )}
            <container>
                <text>
                    Counter: **{count}**
                    <br />
                    Instance ID: **{instanceId}**
                </text>
                <row>
                    <button
                        style="danger"
                        onClick={() => setCount(c => c - 1)}
                        customId="dcr"
                    >
                        -1
                    </button>
                    <button
                        style="success"
                        onClick={() => setCount(c => c + 1)}
                        customId="incr"
                    >
                        +1
                    </button>
                </row>
                <row>
                    <button style="secondary" customId="nil">
                        No Event Handler
                    </button>

                    <button style="danger" onClick={() => setDoThrow(true)} customId="throw">
                        Make component throw
                    </button>
                    <button style="danger" onClick={() => setError(true)} customId="invalid">
                        Make payload invalid
                    </button>
                </row>
                <row>
                    <button style="primary" onClick={() => {
                        openModal(
                            <modal title="Add custom amount" onSubmit={(int: ModalSubmitInteraction) => {
                                setCount(500);
                            }}>
                                <label label="Amount">
                                    <text-input
                                        customId="amount"
                                    />
                                </label>
                            </modal>
                        );
                    }}>
                        Open modal
                    </button>
                </row>
            </container>
        </message>
    )
};
