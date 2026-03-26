const { 
  Client,
  GatewayIntentBits,
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

  // 🔵 FFWS (GRUPOS)
  "1485225770287894530": {
    tipo: "grupos",
    rolBase: "FFWS",
    canalNoti: "📢┋notificaciones",
    canalSolicitudes: "📋┃solicitudes",
    lobbyCanales: {
      "A-B": "📜┃lobby-a-b",
      "B-C": "📜┃lobby-b-c",
      "C-A": "📜┃lobby-c-a"
    },
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

  // 🟢 NACIONES
  "1486297664051216445": {
    tipo: "equipos",
    rolBase: "PUROS CRACKS",
    canalNoti: "📢┋notificaciones",
    canalSolicitudes: "📋┃solicitudes", 
    lobbyCanal: "📜┃lobby-id-pass",
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

let solicitudes = {};
let partidas = {};

client.once('clientReady', () => {
  console.log(`🔥 Bot activo como ${client.user.tag}`);
});

// =====================
// 📌 COMANDOS
// =====================
client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  if (msg.content === '!panel') {
    const btn = new ButtonBuilder()
      .setCustomId('registro')
      .setLabel('📋 Registrarse')
      .setStyle(ButtonStyle.Primary);

    msg.channel.send({
      content: '📋 Sistema de registro',
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }

  if (msg.content === '!match') {
    const btn = new ButtonBuilder()
      .setCustomId('match')
      .setLabel('🏁 Finalizar partida')
      .setStyle(ButtonStyle.Success);

    msg.channel.send({
      content: '🎮 Sistema de partidas',
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }

  if (msg.content === '!lobby') {
    const btn = new ButtonBuilder()
      .setCustomId('lobby')
      .setLabel('📜 Crear Lobby')
      .setStyle(ButtonStyle.Primary);

    msg.channel.send({
      content: '📜 Sistema lobby',
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }
});

// =====================
// ⚙️ INTERACCIONES
// =====================
client.on('interactionCreate', async (interaction) => {

  const CONFIG = CONFIGS[interaction.guild?.id];
  if (!CONFIG) return;

  // =====================
  // 🎮 REGISTRO
  // =====================
  if (interaction.isButton() && interaction.customId === 'registro') {

    const equipoMenu = new StringSelectMenuBuilder()
      .setCustomId('reg_equipo')
      .setPlaceholder('Equipo')
      .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label: e, value: e })));

    const rolMenu = new StringSelectMenuBuilder()
      .setCustomId('reg_rol')
      .setPlaceholder('Rol')
      .addOptions(CONFIG.roles.map(r => ({ label: r, value: r })));

    let rows = [
      new ActionRowBuilder().addComponents(equipoMenu),
      new ActionRowBuilder().addComponents(rolMenu)
    ];

    if (CONFIG.tipo === "grupos") {
      const grupoMenu = new StringSelectMenuBuilder()
        .setCustomId('reg_grupo')
        .setPlaceholder('Grupo')
        .addOptions([
          { label: 'GRUPO A', value: 'A' },
          { label: 'GRUPO B', value: 'B' },
          { label: 'GRUPO C', value: 'C' }
        ]);

      rows.push(new ActionRowBuilder().addComponents(grupoMenu));
    }

    return interaction.reply({ content: 'Registro:', components: rows, ephemeral: true });
  }

  // SELECT REGISTRO
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('reg_')) {

    const u = interaction.user.id;
    solicitudes[u] ??= {};
    solicitudes[u][interaction.customId] = interaction.values[0];

    const data = solicitudes[u];

    if (
      (CONFIG.tipo === "grupos" && data.reg_equipo && data.reg_rol && data.reg_grupo) ||
      (CONFIG.tipo !== "grupos" && data.reg_equipo && data.reg_rol)
    ) {
      return abrirModalRegistro(interaction);
    }

    return interaction.reply({ content: 'Guardado', ephemeral: true });
  }

  // MODAL REGISTRO
  if (interaction.isModalSubmit() && interaction.customId === 'modal_registro') {

    const data = solicitudes[interaction.user.id];
    const nickname = interaction.fields.getTextInputValue('nickname');
    data.nickname = nickname;

    const canal = interaction.guild.channels.cache.find(c => c.name === CONFIG.canalSolicitudes);

    const embed = {
      color: 0x2b2d31,
      title: '📥 Nueva solicitud',
      fields: [
        { name: 'Usuario', value: `<@${interaction.user.id}>` },
        { name: 'Equipo', value: data.reg_equipo, inline: true },
        { name: 'Rol', value: data.reg_rol, inline: true },
        ...(data.reg_grupo ? [{ name: 'Grupo', value: data.reg_grupo, inline: true }] : []),
        { name: 'Nick', value: nickname }
      ]
    };

    const aprobar = new ButtonBuilder()
      .setCustomId(`ok_${interaction.user.id}`)
      .setLabel('✅ Aprobar')
      .setStyle(ButtonStyle.Success);

    const rechazar = new ButtonBuilder()
      .setCustomId(`no_${interaction.user.id}`)
      .setLabel('❌ Rechazar')
      .setStyle(ButtonStyle.Danger);

    await canal.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(aprobar, rechazar)]
    });

    return interaction.reply({ content: '📨 Enviado a revisión', ephemeral: true });
  }

  // APROBAR
  if (interaction.isButton() && interaction.customId.startsWith('ok_')) {

    const id = interaction.customId.split('_')[1];
    const data = solicitudes[id];
    const member = await interaction.guild.members.fetch(id);

    const rolEquipo = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === data.reg_equipo.toLowerCase());
    const rolTipo = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === data.reg_rol.toLowerCase());

    if (rolEquipo) await member.roles.add(rolEquipo);
    if (rolTipo) await member.roles.add(rolTipo);

    const rolBase = interaction.guild.roles.cache.find(
    r => r.name.toLowerCase() === CONFIG.rolBase?.toLowerCase()
    );

    if (rolBase) await member.roles.add(rolBase);

    const tri = CONFIG.equipos[data.reg_equipo];
    await member.setNickname(`[ ${tri} ] ${data.nickname}`);

    return interaction.update({ content: '✅ Aprobado', components: [], embeds: [] });
  }

  // RECHAZAR
  if (interaction.isButton() && interaction.customId.startsWith('no_')) {
    return interaction.update({ content: '❌ Rechazado', components: [], embeds: [] });
  }

  // =====================
  // 🏁 MATCH
  // =====================
  if (interaction.isButton() && interaction.customId === 'match') {

    const canal = interaction.guild.channels.cache.find(c => c.name === CONFIG.canalNoti);

    let texto = CONFIG.tipo === "grupos"
      ? `📢  Finaliza la partida 
@GRUPO A VS @GRUPO B

⏱️ Comienzan los 5 minutos para realizar cambios.

Staffs y suplentes pueden unirse a sus canales de voz.

📌 Reporten cualquier cambio en: #🔄┋cambios`
      : `📢  Finaliza la partida 
@TEAM1 VS @TEAM2

⏱️ Comienzan los 5 minutos para realizar cambios.

Staffs y suplentes pueden unirse a sus canales de voz.

📌 Reporten cualquier cambio en: #🔄┋cambios`;

    await canal.send(texto);

    setTimeout(() => {
      canal.send('⏱️ Finaliza el tiempo para realizar cambios');
    }, 300000);

    return interaction.reply({ content: '✅ Enviado', ephemeral: true });
  }

  // =====================
  // 📜 LOBBY (PRO)
  // =====================
  if (interaction.isButton() && interaction.customId === 'lobby') {

    const mapas = ["Bermuda","Purgatorio","Alpes","Nexterra","Kalahari","Solara"];
    const servers = ["US","SAC"];

    let rows = [];

    if (CONFIG.tipo === "grupos") {

      const g1 = new StringSelectMenuBuilder()
        .setCustomId('lobby_g1')
        .addOptions(["A","B","C"].map(g => ({ label:`GRUPO ${g}`, value:g })));

      const g2 = new StringSelectMenuBuilder()
        .setCustomId('lobby_g2')
        .addOptions(["A","B","C"].map(g => ({ label:`GRUPO ${g}`, value:g })));

      rows.push(
        new ActionRowBuilder().addComponents(g1),
        new ActionRowBuilder().addComponents(g2)
      );

    } else {

      const equipos = Object.keys(CONFIG.equipos);

      const e1 = new StringSelectMenuBuilder()
        .setCustomId('lobby_e1')
        .addOptions(equipos.map(e => ({ label:e, value:e })));

      const e2 = new StringSelectMenuBuilder()
        .setCustomId('lobby_e2')
        .addOptions(equipos.map(e => ({ label:e, value:e })));

      rows.push(
        new ActionRowBuilder().addComponents(e1),
        new ActionRowBuilder().addComponents(e2)
      );
    }

    const mapa = new StringSelectMenuBuilder()
      .setCustomId('lobby_mapa')
      .addOptions(mapas.map(m => ({ label:m, value:m })));

    const server = new StringSelectMenuBuilder()
      .setCustomId('lobby_server')
      .addOptions(servers.map(s => ({ label:s, value:s })));

    rows.push(
      new ActionRowBuilder().addComponents(mapa),
      new ActionRowBuilder().addComponents(server)
    );

    return interaction.reply({ content:'Configura lobby:', components:rows, ephemeral:true });
  }

  // SELECT LOBBY
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('lobby_')) {

    const u = interaction.user.id;
    partidas[u] ??= {};
    partidas[u][interaction.customId] = interaction.values[0];

    const data = partidas[u];

    if (
      (CONFIG.tipo === "grupos" && data.lobby_g1 && data.lobby_g2 && data.lobby_mapa && data.lobby_server) ||
      (CONFIG.tipo !== "grupos" && data.lobby_e1 && data.lobby_e2 && data.lobby_mapa && data.lobby_server)
    ) {
      return abrirModalLobby(interaction);
    }

    return interaction.reply({ content:'Guardado', ephemeral:true });
  }

  // MODAL LOBBY
  if (interaction.isModalSubmit() && interaction.customId === 'modal_lobby') {

    const data = partidas[interaction.user.id];

    const id = interaction.fields.getTextInputValue('id');
    const pass = interaction.fields.getTextInputValue('pass');

    if (CONFIG.tipo === "grupos") {

      const key = `${data.lobby_g1}-${data.lobby_g2}`;
      const canal = interaction.guild.channels.cache.find(c => c.name === CONFIG.lobbyCanales[key]);

      canal.send(`:FFWS: **La sala del @GRUPO ${data.lobby_g1} vs @GRUPO ${data.lobby_g2} es la siguiente:** 

ID: **${id}**
PASS: **${pass}**

:rotating_light: Recuerden:
- Nombre de equipo en mayúsculas.

:fire: ¡Mucho Éxito! :fire:`);

    } else {

      const canal = interaction.guild.channels.cache.find(c => c.name === CONFIG.lobbyCanal);

      canal.send(`**La sala @${data.lobby_e1} vs @${data.lobby_e2} es la siguiente:**  

ID: **${id}**
PASS: **${pass}**
MAPA: **${data.lobby_mapa}**
SERVIDOR: **${data.lobby_server}**

:rotating_light: Recuerden:
- Nombre de equipo en mayúsculas.

:fire: ¡Mucho Éxito! :fire:`);
    }

    return interaction.reply({ content:'📜 Lobby enviado', ephemeral:true });
  }

});

// FUNCIONES
function abrirModalRegistro(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_registro')
    .setTitle('Nickname');

  const input = new TextInputBuilder()
    .setCustomId('nickname')
    .setLabel('Tu nickname')
    .setStyle(TextInputStyle.Short);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return interaction.showModal(modal);
}

function abrirModalLobby(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_lobby')
    .setTitle('Datos de sala');

  modal.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id').setLabel('ID').setStyle(TextInputStyle.Short)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('pass').setLabel('PASS').setStyle(TextInputStyle.Short))
  );

  return interaction.showModal(modal);
}

client.login(TOKEN);
