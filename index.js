const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = process.env.TOKEN;

// 🔥 CONFIG POR SERVIDOR
const CONFIGS = {
  "1485225770287894530": {
    rolBase: "FFWS",
    grupos: ["A", "B", "C"],
    roles: ["JUGADOR", "COACH", "MANAGER", "ANALISTA", "STAFF"],
    equipos: {
      "9z GLOBANT": "9zG",
      "ALL GLORY GAMERHOOD": "AGG",
      "BLUE CHEESE": "BC",
      "CACM ESPORTS": "CACM",
      "CHILL ESPORTS": "CHL",
      "ESTORM DRK": "ESG",
      "FD QUISQUEYA": "QFD",
      "FLORIDA FLF": "FLF",
      "FUEGO": "FGO",
      "GUN DYNASTY": "GD",
      "HNS ESPORTS": "HNS",
      "INFINITY E-SPORTS": "INF",
      "LEVIATÁN": "LEV",
      "LMG ESPORT": "LMG",
      "LYON": "LYON",
      "MONOUGG": "MGG",
      "MOVISTAR KOI": "KOI",
      "NOVA LEGION": "NVL"
    }
  },

  "1486297664051216445": {
    rolBase: "PUROS CRACKS",
    roles: ["JUGADOR", "CAPITAN", "COACH", "MANAGER", "ANALISTA", "STAFF"],
    equipos: {
      "ARGENTINA": "AR",
      "CHILE": "CL",
      "COLOMBIA": "CO",
      "ECUADOR": "EC",
      "LATAM 1": "L1",
      "LATAM 2": "L2",
      "PERU": "PE",
      "MEXICO": "MX"
    }
  }
};

let registros = {};
let solicitudes = {};

client.once('clientReady', () => {
  console.log(`🔥 Bot activo como ${client.user.tag}`);
});

// 📌 COMANDOS
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!panel') {
    const boton = new ButtonBuilder()
      .setCustomId('registro')
      .setLabel('🎮 Registrarse')
      .setStyle(ButtonStyle.Primary);

    message.channel.send({
      content: '🔥 Registro',
      components: [new ActionRowBuilder().addComponents(boton)],
    });
  }

  if (message.content === '!match') {
    const boton = new ButtonBuilder()
      .setCustomId('finalizar_partida')
      .setLabel('🏁 Finalizar partida')
      .setStyle(ButtonStyle.Success);

    message.channel.send({
      content: '🎮 Sistema de partidas',
      components: [new ActionRowBuilder().addComponents(boton)],
    });
  }
});

// 🔥 INTERACCIONES
client.on('interactionCreate', async (interaction) => {

  const guildId = interaction.guild?.id;
  const CONFIG = CONFIGS[guildId];
  if (!CONFIG) return;

  // 🎮 REGISTRO
  if (interaction.isButton() && interaction.customId === 'registro') {

    registros[interaction.user.id] = {};

    const equipoMenu = new StringSelectMenuBuilder()
      .setCustomId('equipo')
      .setPlaceholder('Equipo')
      .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label: e, value: e })));

    const rolMenu = new StringSelectMenuBuilder()
      .setCustomId('rol')
      .setPlaceholder('Rol')
      .addOptions(CONFIG.roles.map(r => ({ label: r, value: r })));

    let components = [
      new ActionRowBuilder().addComponents(equipoMenu),
      new ActionRowBuilder().addComponents(rolMenu)
    ];

    if (CONFIG.grupos) {
      const grupoMenu = new StringSelectMenuBuilder()
        .setCustomId('grupo')
        .setPlaceholder('Grupo')
        .addOptions(CONFIG.grupos.map(g => ({ label: `GRUPO ${g}`, value: g })));

      components.push(new ActionRowBuilder().addComponents(grupoMenu));
    }

    return interaction.reply({ content: 'Selecciona:', components, ephemeral: true });
  }

  // 🏁 BOTÓN PARTIDA
  if (interaction.isButton() && interaction.customId === 'finalizar_partida') {

    partidas[interaction.user.id] = {};

    const equipo1Menu = new StringSelectMenuBuilder()
      .setCustomId('match_equipo1')
      .setPlaceholder('Equipo 1')
      .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label: e, value: e })));

    const equipo2Menu = new StringSelectMenuBuilder()
      .setCustomId('match_equipo2')
      .setPlaceholder('Equipo 2')
      .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label: e, value: e })));

    return interaction.reply({
      content: 'Selecciona equipos:',
      components: [
        new ActionRowBuilder().addComponents(equipo1Menu),
        new ActionRowBuilder().addComponents(equipo2Menu)
      ],
      ephemeral: true
    });
  }

  // 🔽 SELECTS
  if (interaction.isStringSelectMenu()) {

    const user = interaction.user.id;

    // MATCH SELECTS
    if (interaction.customId.startsWith('match_')) {

      partidas[user] ??= {};

      if (interaction.customId === 'match_equipo1') {
        partidas[user].equipo1 = interaction.values[0];
      }

      if (interaction.customId === 'match_equipo2') {
        partidas[user].equipo2 = interaction.values[0];
      }

      const data = partidas[user];

      if (data.equipo1 && data.equipo2) {

        const modal = new ModalBuilder()
          .setCustomId('modal_match')
          .setTitle('Finalizar Partida');

        const partida = new TextInputBuilder()
          .setCustomId('partida')
          .setLabel('Número de partida')
          .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(partida));

        return interaction.showModal(modal);
      }

      return interaction.reply({ content: 'Equipo guardado', ephemeral: true });
    }

    // REGISTRO SELECTS
    registros[user] ??= {};
    registros[user][interaction.customId] = interaction.values[0];

    const data = registros[user];

    if (data.equipo && data.rol && (CONFIG.grupos ? data.grupo : true)) {

      const modal = new ModalBuilder()
        .setCustomId('modal_nick')
        .setTitle('Registro');

      const input = new TextInputBuilder()
        .setCustomId('nickname')
        .setLabel('Nickname')
        .setStyle(TextInputStyle.Short);

      modal.addComponents(new ActionRowBuilder().addComponents(input));

      return interaction.showModal(modal);
    }

    return interaction.reply({ content: 'Guardado', ephemeral: true });
  }

  // 🧾 MODAL REGISTRO
  if (interaction.isModalSubmit() && interaction.customId === 'modal_nick') {

    const user = interaction.user.id;
    const data = registros[user];

    const nickname = interaction.fields.getTextInputValue('nickname');

    data.nickname = nickname;
    data.tricode = CONFIG.equipos[data.equipo];

    solicitudes[user] = data;

    const canal = interaction.guild.channels.cache.find(c => c.name === '📋┃solicitudes');

    const embed = new EmbedBuilder()
      .setTitle('Solicitud')
      .addFields(
        { name: 'Usuario', value: `<@${user}>` },
        { name: 'Equipo', value: data.equipo },
        { name: 'Rol', value: data.rol },
        ...(CONFIG.grupos ? [{ name: 'Grupo', value: data.grupo }] : []),
        { name: 'Nick', value: nickname }
      );

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`aprobar_${user}`).setLabel('Aprobar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`rechazar_${user}`).setLabel('Rechazar').setStyle(ButtonStyle.Danger)
    );

    canal.send({ embeds: [embed], components: [botones] });

    return interaction.reply({ content: 'Enviado', ephemeral: true });
  }

  // 🏁 MODAL PARTIDA
  if (interaction.isModalSubmit() && interaction.customId === 'modal_match') {

    const user = interaction.user.id;
    const data = partidas[user];

    if (!data) return;

    const partida = interaction.fields.getTextInputValue('partida');

    const rol1 = interaction.guild.roles.cache.find(r => r.name === data.equipo1);
    const rol2 = interaction.guild.roles.cache.find(r => r.name === data.equipo2);

    const msg = `📢 **Finaliza la partida ${partida}**
<@&${rol1.id}> VS <@&${rol2.id}>

⏱️ 5 minutos para cambios
📌 Canal: 🔄┋cambios`;

    await interaction.channel.send(msg);

    await interaction.reply({ content: 'Partida enviada', ephemeral: true });

    setTimeout(() => {
      interaction.channel.send('⏱️ Tiempo finalizado');
    }, 300000);

    delete partidas[user];
  }

  // ✅ APROBAR / ❌ RECHAZAR
  if (interaction.isButton()) {

    const userId = interaction.customId.split('_')[1];
    const data = solicitudes[userId];

    if (!data) return;

    const member = await interaction.guild.members.fetch(userId);

    const roles = [
      data.equipo,
      CONFIG.rolBase,
      data.rol,
      CONFIG.grupos ? `GRUPO ${data.grupo}` : null
    ];

    for (const r of roles) {
      if (!r) continue;
      const role = interaction.guild.roles.cache.find(x => x.name === r);
      if (role) await member.roles.add(role);
    }

    await member.setNickname(`[ ${data.tricode} ] ${data.nickname}`);

    delete solicitudes[userId];

    return interaction.reply({ content: 'Procesado', ephemeral: true });
  }

});

client.login(TOKEN);
