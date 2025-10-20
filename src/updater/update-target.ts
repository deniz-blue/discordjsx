import { BaseChannel, BaseInteraction, BaseMessageOptions, ButtonInteraction, ChannelSelectMenuInteraction, ChatInputCommandInteraction, MentionableSelectMenuInteraction, Message, MessageFlags, ModalSubmitInteraction, RoleSelectMenuInteraction, SendableChannels, StringSelectMenuInteraction, TextBasedChannel, User, UserSelectMenuInteraction } from "discord.js";
import { pickMessageFlags } from "./utils.js";

export const INTERACTION_TOKEN_EXPIRY = 15 * 60 * 1000;
export const INTERACTION_REPLY_EXPIRY = 3 * 1000;

export type MessageUpdateable =
    | ChatInputCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction
    | UserSelectMenuInteraction
    | RoleSelectMenuInteraction
    | MentionableSelectMenuInteraction
    | ChannelSelectMenuInteraction
    | ModalSubmitInteraction
    | (BaseChannel & TextBasedChannel & SendableChannels)
    | Message
    | User;

export const getTargetExpiration = (target: MessageUpdateable): number | null => {
    if (target instanceof BaseInteraction) return INTERACTION_TOKEN_EXPIRY;

    return null;
};

export const getTargetResponseDeadline = (target: MessageUpdateable) => {
    if (target instanceof BaseInteraction) {
        if (!target.replied && !target.deferred) return INTERACTION_REPLY_EXPIRY;
    }
    return null;
};

export const deferTarget = async (target: MessageUpdateable) => {
    if (target instanceof BaseInteraction) {
        if (target.replied || target.deferred) return;

        if (target.isMessageComponent() || (target.isModalSubmit() && target.isFromMessage())) {
            await target.deferUpdate();
        } else if (target.isRepliable()) {
            await target.deferReply();
        }
    }
}

export type MessageUpdateData = BaseMessageOptions & {
    flags?: MessageFlags[];
};

/**
 * Updates a {@link MessageUpdateable} with a {@link MessageUpdateData} and returns a new target if it changes
 * @param target Target to update
 * @param payload Message payload
 * @returns The new target if it changed, null if the target stayed the same
 */
export const updateTarget = async (
    target: MessageUpdateable,
    payload: MessageUpdateData,
): Promise<MessageUpdateable | null> => {
    const flags = payload.flags ?? [];

    if (target instanceof BaseInteraction) {
        if (target.replied || target.deferred) {
            await target.editReply({
                ...payload,
                flags: pickMessageFlags(flags, [MessageFlags.SuppressEmbeds, MessageFlags.IsComponentsV2]),
            });
        } else {
            if (
                target.isChatInputCommand()
                || (target.isModalSubmit() && !target.isFromMessage())
            ) {
                await target.reply({
                    ...payload,
                    flags: pickMessageFlags(flags, [
                        MessageFlags.Ephemeral,
                        MessageFlags.SuppressEmbeds,
                        MessageFlags.SuppressNotifications,
                        MessageFlags.IsComponentsV2,
                    ]),
                });
            } else if (
                target.isMessageComponent()
                || (target.isModalSubmit() && target.isFromMessage())
            ) {
                await target.update({
                    ...payload,
                    flags: pickMessageFlags(flags, [MessageFlags.SuppressEmbeds, MessageFlags.IsComponentsV2]),
                });
            }
        }
    } else if (target instanceof Message) {
        await target.edit({
            ...payload,
            flags: pickMessageFlags(flags, [MessageFlags.SuppressEmbeds, MessageFlags.IsComponentsV2]),
        });
    } else if (target instanceof BaseChannel) {
        // Changes target!
        return await target.send({
            ...payload,
            flags: pickMessageFlags(flags, [
                MessageFlags.SuppressEmbeds,
                MessageFlags.SuppressNotifications,
                MessageFlags.IsComponentsV2,
            ]),
        });
    } else if (target instanceof User) {
        // Changes target!
        return await (await target.createDM()).send({
            ...payload,
            flags: pickMessageFlags(flags, [
                MessageFlags.SuppressEmbeds,
                MessageFlags.SuppressNotifications,
                MessageFlags.IsComponentsV2,
            ]),
        });
    }

    // target unchanged
    return null;
};
