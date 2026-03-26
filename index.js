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
    equipos: { "ARGENTINA": "AR" }
  },

  "1486505742235336886": {
    soloEquipo: true,
    equipos: { "CHILE": "CL" }
  },

  "1486507104121651311": {
    soloEquipo: true,
    equipos: { "COLOMBIA": "CO" }
  },

  "1486507356341932163": {
    soloEquipo: true,
    equipos: { "ECUADOR": "EC" }
  },

  "1486507729584521217": {
    soloEquipo: true,
    equipos: { "LATAM 1": "L1" }
  },

  "1486508224222859294": {
    soloEquipo: true,
    equipos: { "LATAM 2": "L2" }
  },

  "1486508476879339622": {
    soloEquipo: true,
    equipos: { "MÉXICO": "MX" }
  },

  "1486508992632193127": { 
    soloEquipo: true,
    equipos: { "PERÚ": "PE" }
  }
};

// 🎮 VARIABLES
const MAPAS = ["Bermuda","Purgatorio","Alpes","Nexterra","Kalahari","Solara"];
const SERVIDORES = ["US","SAC"];

let dataStore = {};

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

    // =====================
    // 🎮 REGISTRO
    // =====================

    if (interaction.isButton() && interaction.customId === 'registro') {

      const equipos = Object.keys(CONFIG.equipos);

      const equipoMenu = new StringSelectMenuBuilder()
        .setCustomId('reg_equipo')
        .setPlaceholder('Equipo')
        .addOptions(equipos.map(e => ({ label: e, value: e })));

      const rolMenu = new StringSelectMenuBuilder()
        .setCustomId('reg_rol')
        .setPlaceholder('Rol')
        .addOptions((CONFIG.roles || ["JUGADOR"]).map(r => ({ label: r, value: r })));

      return interaction.reply({
        content: 'Registro:',
        components: [
          new ActionRowBuilder().addComponents(equipoMenu),
          new ActionRowBuilder().addComponents(rolMenu)
        ],
        ephemeral: true
      });
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('reg_')) {

      const u = interaction.user.id;
      dataStore[u] ??= {};

      dataStore[u][interaction.customId] = interaction.values[0];

      const data = dataStore[u];

      if (data.reg_equipo && data.reg_rol) {

        const modal = new ModalBuilder()
          .setCustomId('modal_registro')
          .setTitle('Registro');

        const nick = new TextInputBuilder()
          .setCustomId('nickname')
          .setLabel('Nickname')
          .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(nick));

        return interaction.showModal(modal);
      }

      return interaction.reply({ content:'Guardado', ephemeral:true });
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_registro') {

      const data = dataStore[interaction.user.id];
      const nickname = interaction.fields.getTextInputValue('nickname');

      const rolEquipo = interaction.guild.roles.cache.find(r => r.name === data.reg_equipo);
      const rolTipo = interaction.guild.roles.cache.find(r => r.name === data.reg_rol);

      if (rolEquipo) await interaction.member.roles.add(rolEquipo);

      if (!CONFIG.soloEquipo && rolTipo) {
        await interaction.member.roles.add(rolTipo);
      }

      const tri = CONFIG.equipos[data.reg_equipo];

      await interaction.member.setNickname(`[ ${tri} ] ${nickname}`);

      return interaction.reply({ content:'✅ Registro completado', ephemeral:true });
    }

    // =====================
    // 🏁 MATCH
    // =====================

    if (interaction.isButton() && interaction.customId === 'match') {

      const equipos = Object.keys(CONFIG.equipos);

      const e1 = new StringSelectMenuBuilder()
        .setCustomId('m1')
        .addOptions(equipos.map(e => ({ label:e, value:e })));

      const e2 = new StringSelectMenuBuilder()
        .setCustomId('m2')
        .addOptions(equipos.map(e => ({ label:e, value:e })));

      return interaction.reply({
        content:'Selecciona equipos',
        components:[
          new ActionRowBuilder().addComponents(e1),
          new ActionRowBuilder().addComponents(e2)
        ],
        ephemeral:true
      });
    }

    // =====================
    // 📜 LOBBY
    // =====================

    if (interaction.isButton() && interaction.customId === 'lobby') {

      if (CONFIG.grupos) {

        const g1 = new StringSelectMenuBuilder()
          .setCustomId('g1')
          .addOptions(CONFIG.grupos.map(g => ({ label:`GRUPO ${g}`, value:g })));

        const g2 = new StringSelectMenuBuilder()
          .setCustomId('g2')
          .addOptions(CONFIG.grupos.map(g => ({ label:`GRUPO ${g}`, value:g })));

        return interaction.reply({
          content:'Selecciona grupos',
          components:[
            new ActionRowBuilder().addComponents(g1),
            new ActionRowBuilder().addComponents(g2)
          ],
          ephemeral:true
        });
      }

      const equipos = Object.keys(CONFIG.equipos);

      const e1 = new StringSelectMenuBuilder()
        .setCustomId('l1')
        .addOptions(equipos.map(e => ({ label:e, value:e })));

      const e2 = new StringSelectMenuBuilder()
        .setCustomId('l2')
        .addOptions(equipos.map(e => ({ label:e, value:e })));

      return interaction.reply({
        content:'Selecciona equipos',
        components:[
          new ActionRowBuilder().addComponents(e1),
          new ActionRowBuilder().addComponents(e2)
        ],
        ephemeral:true
      });
    }

  } catch (err) {
    console.error(err);
    if (interaction.isRepliable()) {
      interaction.reply({ content:'❌ Error', ephemeral:true });
    }
  }
});

client.login(TOKEN);
