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

let partidas = {};

// 🔥 READY
client.once('clientReady', () => {
  console.log(`🔥 Bot activo como ${client.user.tag}`);
});

// 📌 COMANDOS
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 🎮 PANEL DE REGISTRO
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

  // 🏁 FINALIZAR PARTIDA
  if (message.content === '!match') {
    const btn = new ButtonBuilder()
      .setCustomId('finalizar_partida')
      .setLabel('🏁 Finalizar partida')
      .setStyle(ButtonStyle.Success);

    return message.channel.send({
      content: '🎮 Sistema de partidas',
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }

  // 📜 CREAR LOBBY
  if (message.content === '!lobby') {
    const btn = new ButtonBuilder()
      .setCustomId('crear_lobby')
      .setLabel('📜 Crear Lobby')
      .setStyle(ButtonStyle.Primary);

    return message.channel.send({
      content: '📜 Sistema de lobby',
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }
});

// 🔥 INTERACCIONES
client.on('interactionCreate', async (interaction) => {
  try {

    const CONFIG = CONFIGS[interaction.guild.id];
    if (!CONFIG) return;

    // 🏁 MATCH
    if (interaction.isButton() && interaction.customId === 'finalizar_partida') {

      partidas[interaction.user.id] = {};
      const equipos = Object.keys(CONFIG.equipos);

      const e1 = new StringSelectMenuBuilder()
        .setCustomId('match_e1')
        .addOptions(equipos.map(e => ({ label: e, value: e })));

      const e2 = new StringSelectMenuBuilder()
        .setCustomId('match_e2')
        .addOptions(equipos.map(e => ({ label: e, value: e })));

      return interaction.reply({
        content: 'Selecciona equipos:',
        components: [
          new ActionRowBuilder().addComponents(e1),
          new ActionRowBuilder().addComponents(e2)
        ],
        ephemeral: true
      });
    }

    // 📜 LOBBY
    if (interaction.isButton() && interaction.customId === 'crear_lobby') {

      partidas[interaction.user.id] = {};

      if (CONFIG.grupos) {
        const g1 = new StringSelectMenuBuilder()
          .setCustomId('lobby_g1')
          .addOptions(CONFIG.grupos.map(g => ({ label:`GRUPO ${g}`, value:g })));

        const g2 = new StringSelectMenuBuilder()
          .setCustomId('lobby_g2')
          .addOptions(CONFIG.grupos.map(g => ({ label:`GRUPO ${g}`, value:g })));

        return interaction.reply({
          content:'Selecciona grupos:',
          components:[
            new ActionRowBuilder().addComponents(g1),
            new ActionRowBuilder().addComponents(g2)
          ],
          ephemeral:true
        });
      }

      const equipos = Object.keys(CONFIG.equipos);

      const e1 = new StringSelectMenuBuilder()
        .setCustomId('lobby_e1')
        .addOptions(equipos.map(e => ({ label:e, value:e })));

      const e2 = new StringSelectMenuBuilder()
        .setCustomId('lobby_e2')
        .addOptions(equipos.map(e => ({ label:e, value:e })));

      return interaction.reply({
        content:'Selecciona equipos:',
        components:[
          new ActionRowBuilder().addComponents(e1),
          new ActionRowBuilder().addComponents(e2)
        ],
        ephemeral:true
      });
    }

    // 🔽 SELECTS
    if (interaction.isStringSelectMenu()) {

      const u = interaction.user.id;
      partidas[u] ??= {};
      partidas[u][interaction.customId] = interaction.values[0];

      const data = partidas[u];

      if (data.match_e1 && data.match_e2) {
        const modal = new ModalBuilder()
          .setCustomId('modal_match')
          .setTitle('Finalizar partida');

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('partida')
              .setLabel('Número partida')
              .setStyle(TextInputStyle.Short)
          )
        );

        return interaction.showModal(modal);
      }

      if (
        (data.lobby_g1 && data.lobby_g2) ||
        (data.lobby_e1 && data.lobby_e2)
      ) {

        const modal = new ModalBuilder()
          .setCustomId('modal_lobby')
          .setTitle('Datos');

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('id').setLabel('ID').setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('pass').setLabel('PASS').setStyle(TextInputStyle.Short)
          )
        );

        return interaction.showModal(modal);
      }

      return interaction.reply({ content:'Guardado', ephemeral:true });
    }

    // 🏁 MENSAJE FINAL PARTIDA
    if (interaction.isModalSubmit() && interaction.customId === 'modal_match') {

      const data = partidas[interaction.user.id];
      const partida = interaction.fields.getTextInputValue('partida');

      const rol1 = interaction.guild.roles.cache.find(r => r.name === data.match_e1);
      const rol2 = interaction.guild.roles.cache.find(r => r.name === data.match_e2);

      const canal = interaction.guild.channels.cache.find(c => c.name === '📢┃notificaciones');
      const cambios = interaction.guild.channels.cache.find(c => c.name === '🔄┋cambios');

      await canal.send(
`📢  **Finaliza la partida ${partida}**
<@&${rol1.id}> VS <@&${rol2.id}>  

⏱️ **Comienzan los 5 minutos para realizar cambios.**

_Staffs y suplentes pueden unirse a sus canales de voz._

📌 Reporten cualquier cambio en el canal: ${cambios ? `<#${cambios.id}>` : '#🔄┋cambios'}`
      );

      setTimeout(() => {
        canal.send('⏱️ **Finaliza el tiempo para realizar cambios**');
      }, 300000);

      return interaction.reply({ content:'✅ Enviado', ephemeral:true });
    }

  } catch (err) {
    console.error(err);
    if (interaction.isRepliable()) {
      interaction.reply({ content:'❌ Error', ephemeral:true });
    }
  }
});

client.login(TOKEN);
