import type { PropsWithChildren } from "react";
import { InstanceContext } from "./context.js";

// @jsxRuntime automatic

export interface WrapperProps extends PropsWithChildren {
    context: InstanceContext;
    customWrapper?: React.ComponentType<any>;
};

export const Wrapper = ({
    context,
    children,
    customWrapper,
}: WrapperProps) => {
    const InnerWrapper: React.ComponentType<any> = customWrapper || (({ children }) => children);

    return (
        <InstanceContext value={context}>
            <InnerWrapper>
                {children}
            </InnerWrapper>
        </InstanceContext>
    );
};
