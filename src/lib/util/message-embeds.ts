import { Colors, EmbedBuilder, GuildBasedChannel, GuildMember, Message, PermissionFlagsBits } from "discord.js";
import { MessageLinkRegex } from '@sapphire/discord-utilities';
import { container } from "@sapphire/pieces";
import { isGuildBasedChannel } from "@sapphire/discord.js-utilities";

const { client } = container;

/**
 * Whether or not the member can access a specific channel.
 * @param memberInfo Information about the member.
 * @param channelId The id for the channel to check access for.
 * @returns {Promise<boolean>} If the member can access the channel.
 */
async function canViewChannel(memberInfo: GuildMember, channel: GuildBasedChannel): Promise<boolean> {
    const hasPermission = channel
        .permissionsFor(memberInfo)
        .has([ PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory ]);

    if (hasPermission) return false;

    return true;
}

/**
 * Get the contents of the message.
 * @param memberInfo Information about the member trying to embed the message.
 * @param messageDetails Information from the message link.
 * @returns {Promise<Message | null>} The message content.
 */
export async function getMessageContent(memberInfo: GuildMember, messageDetails: { guildId: string, channelId: string, messageId: string }): Promise<Message | null> {
    const guild = await client.guilds.fetch(messageDetails.guildId);
    if (!guild) return null;

    const channel = await guild.channels.fetch(messageDetails.channelId);
    
    if (!channel) return null;
    if (!channel.isTextBased() && !channel.isThread()) return null;
    if (!canViewChannel(memberInfo, channel)) return null;

    const message = await channel.messages.fetch(messageDetails.messageId);
    if (!message) return null;

    return message;
}

/**
 * Create an embed for a message.
 * @param message The message content to embed.
 * @returns {Promise<EmbedBuilder[]>}
 */
export async function createMessageEmbed(message: Message): Promise<EmbedBuilder[]> {
    let { author, content, createdTimestamp, attachments, url, guild, channel } = message;
    author = await author.fetch(true);
    
    const embed = new EmbedBuilder({
        color: author.accentColor || Colors.White,
        author: {
            name: ( author.discriminator !== '0'
                ? author.tag
                : (author.globalName !== null
                    ? `${author.globalName} (@${author.username})`
                    : `@${author.username}`
                )
            ),
            iconURL: author.displayAvatarURL({ extension: 'png', size: 256 }) || author.defaultAvatarURL
        },
        description: content,
        footer: {
            text: isGuildBasedChannel(channel)
                ? `#${channel.name} - ${guild?.name}`
                : `${channel.id}`,
            iconURL: guild?.iconURL() || undefined
        },
        timestamp: createdTimestamp
    });

    const embedImages = Array.from(attachments.values()).reduce((acc, attachment, index) => {
        if (index === 0) {
            embed.setURL(url).setImage(attachment.url);
            return acc;
        }

        return [
            ...acc,
            new EmbedBuilder({
                url: message.url,
                image: { url: attachment.url }
            })
        ];
    }, []) as EmbedBuilder[];

    return [embed, ...embedImages];
}

/**
 * Parse a singular message link.
 * @param link The message link to parse.
 */
export async function parseMessageLink(link: string) {
    const result = MessageLinkRegex.exec(link);

    if (!result?.groups) return null;
    const { groups } = result;
    
    if (!container.client.guilds.cache.get(groups.guildId)) return null;

    return {
        guildId: groups.guildId,
        channelId: groups.channelId,
        messageId: groups.messageId
    }
}

/**
 * Parse message content to get all message links.
 * @param content The message content to parse.
 */
export function parseMessageLinks(content: string) {
    const contents = content.split(/(?:\n| )+/);
    const guilds = client.guilds.cache.map((g) => g.id);

    const links: { guildId: string, channelId: string, messageId: string }[] = [];
    for (const string of contents) {
        const result = MessageLinkRegex.exec(string)

        if (!result?.groups) continue;
        const { groups } = result;

        // duplicate link.
        if (links.find((link) => link.messageId === groups.messageId)) continue;
 
        // bot is not in the guild
        if (!guilds.includes(groups.guildId)) continue;

        links.push({
            guildId: groups.guildId,
            channelId: groups.channelId,
            messageId: groups.messageId
        });
    }

    return links;
}