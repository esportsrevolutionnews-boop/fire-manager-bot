const { 
  Client, GatewayIntentBits,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, ModalBuilder,
  TextInputBuilder, TextInputStyle
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

  // 🔵 FFWS (GRUPOS)
  "1485225770287894530": {
    rolBase: "FFWS",
    grupos: ["A", "B", "C"],
    roles: ["JUGADOR", "COACH", "MANAGER", "ANALISTA", "STAFF"],
    lobbyCanales: {
      "A-B": "📜┃lobby-a-b",
      "B-C": "📜┃lobby-b-c",
      "C-A": "📜┃lobby-c-a"
    },
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

  // 🟢 NACIONES
  "1486297664051216445": {
    rolBase: "PUROS CRACKS",
    roles: ["JUGADOR", "CAPITAN", "COACH", "MANAGER", "ANALISTA", "STAFF"],
    lobbyCanal: "📜┃lobby-id-pass",
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
  },

  // 🔴 SERVERS INDIVIDUALES (SOLO EQUIPO)

  "1486505450064056431": {
    soloEquipo: true,
    autoRegistro: true,
    equipos: { "ARGENTINA": "AR" }
  },

  "1486505742235336886": {
    soloEquipo: true,
    autoRegistro: true,
    equipos: { "CHILE": "CL" }
  },

  "1486507104121651311": {
    soloEquipo: true,
    autoRegistro: true,
    equipos: { "COLOMBIA": "CO" }
  },

  "1486507356341932163": {
    soloEquipo: true,
    autoRegistro: true,
    equipos: { "ECUADOR": "EC" }
  },

  "1486507729584521217": {
    soloEquipo: true,
    autoRegistro: true,
    equipos: { "LATAM 1": "L1" }
  },

  "1486508224222859294": {
    soloEquipo: true,
    autoRegistro: true,
    equipos: { "LATAM 2": "L2" }
  },

  "1486508476879339622": {
    soloEquipo: true,
    autoRegistro: true,
    equipos: { "MÉXICO": "MX" }
  },

  "1486508992632193127": { 
    soloEquipo: true,
    autoRegistro: true,
    equipos: { "PERÚ": "PE" }
  }
};

let store = {};

client.once('clientReady', () => {
  console.log(`🔥 Bot activo como ${client.user.tag}`);
});

// 📌 COMANDOS
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!panel') {
    const btn = new ButtonBuilder()
      .setCustomId('registro')
      .setLabel('🎮 Registrarse')
      .setStyle(ButtonStyle.Primary);

    return message.channel.send({
      content: '🔥 Panel de registro',
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }

  if (message.content === '!match') {
    const btn = new ButtonBuilder()
      .setCustomId('match')
      .setLabel('🏁 Finalizar partida')
      .setStyle(ButtonStyle.Success);

    return message.channel.send({
      content: '🎮 Sistema partidas',
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }

  if (message.content === '!lobby') {
    const btn = new ButtonBuilder()
      .setCustomId('lobby')
      .setLabel('📜 Crear Lobby')
      .setStyle(ButtonStyle.Primary);

    return message.channel.send({
      content: '📜 Sistema lobby',
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }
});

// 🔥 INTERACCIONES
client.on('interactionCreate', async (interaction) => {
  try {

    const CONFIG = CONFIGS[interaction.guild.id];
    if (!CONFIG) return;

    // =================
    // 🎮 REGISTRO BOTÓN
    // =================
    if (interaction.isButton() && interaction.customId === 'registro') {

      const equipos = Object.keys(CONFIG.equipos);

      const equipoMenu = new StringSelectMenuBuilder()
        .setCustomId('equipo')
        .setPlaceholder('Equipo')
        .addOptions(equipos.map(e => ({ label: e, value: e })));

      const rolMenu = new StringSelectMenuBuilder()
        .setCustomId('rol')
        .setPlaceholder('Rol')
        .addOptions((CONFIG.roles || ["JUGADOR"]).map(r => ({ label: r, value: r })));

      let components = [
        new ActionRowBuilder().addComponents(equipoMenu),
        new ActionRowBuilder().addComponents(rolMenu)
      ];

      // 👉 SOLO FFWS
      if (CONFIG.grupos) {
        const grupoMenu = new StringSelectMenuBuilder()
          .setCustomId('grupo')
          .setPlaceholder('Grupo')
          .addOptions(CONFIG.grupos.map(g => ({
            label: `GRUPO ${g}`,
            value: g
          })));

        components.push(new ActionRowBuilder().addComponents(grupoMenu));
      }

      return interaction.reply({
        content: 'Registro:',
        components,
        ephemeral: true
      });
    }

    // =================
    // SELECT REGISTRO
    // =================
    if (interaction.isStringSelectMenu()) {

      const u = interaction.user.id;
      store[u] ??= {};
      store[u][interaction.customId] = interaction.values[0];

      const data = store[u];

      if (
        data.equipo &&
        data.rol &&
        (CONFIG.grupos ? data.grupo : true)
      ) {

        const modal = new ModalBuilder()
          .setCustomId('modal_registro')
          .setTitle('Nickname');

        const nick = new TextInputBuilder()
          .setCustomId('nickname')
          .setLabel('Tu nickname')
          .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(nick));

        return interaction.showModal(modal);
      }

      return interaction.reply({ content: 'Guardado', ephemeral: true });
    }

    // =================
    // FINAL REGISTRO
    // =================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_registro') {

      const data = store[interaction.user.id];
      const nickname = interaction.fields.getTextInputValue('nickname');

      const rolEquipo = interaction.guild.roles.cache.find(r => r.name === data.equipo);
      const rolTipo = interaction.guild.roles.cache.find(r => r.name === data.rol);

      const tri = CONFIG.equipos[data.equipo];

      // 🔴 AUTO REGISTRO
      if (CONFIG.autoRegistro) {

        if (rolEquipo) await interaction.member.roles.add(rolEquipo);

        await interaction.member.setNickname(`[ ${tri} ] ${nickname}`);

        return interaction.reply({
          content: '✅ Registro completado automáticamente',
          ephemeral: true
        });
      }

      // 🟢 CON APROBACIÓN
      const canal = interaction.guild.channels.cache.find(c => c.name === '📋┃solicitudes');

      if (!canal) {
        return interaction.reply({
          content: '❌ No existe canal solicitudes',
          ephemeral: true
        });
      }

      const embed = {
        title: '📥 Solicitud',
        description: `
👤 <@${interaction.user.id}>
🏷 ${nickname}
🎮 ${data.equipo}
🎯 ${data.rol}
${data.grupo ? `👥 Grupo ${data.grupo}` : ''}
        `
      };

      const aprobar = new ButtonBuilder()
        .setCustomId(`ok_${interaction.user.id}`)
        .setLabel('✅')
        .setStyle(ButtonStyle.Success);

      canal.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(aprobar)]
      });

      return interaction.reply({
        content: '📨 Enviado a revisión',
        ephemeral: true
      });
    }

    // =================
    // APROBACIÓN
    // =================
    if (interaction.isButton() && interaction.customId.startsWith('ok_')) {

      const id = interaction.customId.split('_')[1];
      const member = await interaction.guild.members.fetch(id);
      const data = store[id];

      const rolEquipo = interaction.guild.roles.cache.find(r => r.name === data.equipo);
      const rolTipo = interaction.guild.roles.cache.find(r => r.name === data.rol);

      if (rolEquipo) await member.roles.add(rolEquipo);

      if (!CONFIG.soloEquipo && rolTipo) {
        await member.roles.add(rolTipo);
      }

      const tri = CONFIG.equipos[data.equipo];

      await member.setNickname(`[ ${tri} ] ${member.user.username}`);

      return interaction.update({
        content: '✅ Aprobado',
        components: [],
        embeds: []
      });
    }

  } catch (err) {
    console.error(err);
    if (interaction.isRepliable()) {
      interaction.reply({ content: '❌ Error', ephemeral: true });
    }
  }
});

client.login(TOKEN);
