import type { PropsWithChildren } from "react";
import { InternalContext } from "./context.js";

// @jsxRuntime automatic

export interface WrapperProps extends PropsWithChildren {
    context: InternalContext;
    customWrapper?: React.ComponentType<PropsWithChildren> | null;
};

const NoOpWrapper: React.ComponentType<PropsWithChildren> = ({ children }) => {
    return <>{children}</>;
};

export const Wrapper = ({
    context,
    children,
    customWrapper,
}: WrapperProps) => {
    const InnerWrapper: React.ComponentType<PropsWithChildren> = customWrapper || NoOpWrapper;

    return (
        <InternalContext value={context}>
            <InnerWrapper>
                {children}
            </InnerWrapper>
        </InternalContext>
    );
};
