const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');

let subscription = null;
let player = null;
let channel = null;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('discord tts bot')
        .addStringOption(option =>
			option
				.setName('context')
				.setDescription('context')
				.setRequired(true)),
    async execute(interaction) {
        channel = interaction.channel;
        const message = interaction.options.getString('context');

        try {
            const connection = joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            connection.once(VoiceConnectionStatus.Ready, () => {
                console.log('Connection is ready!');
            });

            if (!player) {
                player = createAudioPlayer();
            }

            if (!subscription) {
                subscription = connection.subscribe(player);
            }

            await interaction.reply({ content: 'TTS!', ephemeral: true });

            const url = googleTTS.getAudioUrl(message, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
            });

            const resource = createAudioResource(url);
            player.play(resource);

            player.once(AudioPlayerStatus.Idle, () => {
                player.stop();
            });
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while trying to play the playlist.');
        }
    },
};