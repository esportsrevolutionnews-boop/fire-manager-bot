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

  // 🔵 FFWS (GRUPOS)
  "1485225770287894530": {
    rolBase: "FFWS",
    grupos: ["A", "B", "C"],
    roles: ["JUGADOR","COACH","MANAGER","ANALISTA","STAFF"],
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

  "1486505450064056431": { soloEquipo: true, equipos: { "ARGENTINA": "AR" } },
  "1486505742235336886": { soloEquipo: true, equipos: { "CHILE": "CL" } },
  "1486507104121651311": { soloEquipo: true, equipos: { "COLOMBIA": "CO" } },
  "1486507356341932163": { soloEquipo: true, equipos: { "ECUADOR": "EC" } },
  "1486507729584521217": { soloEquipo: true, equipos: { "LATAM 1": "L1" } },
  "1486508224222859294": { soloEquipo: true, equipos: { "LATAM 2": "L2" } },
  "1486508476879339622": { soloEquipo: true, equipos: { "MÉXICO": "MX" } },
  "1486508992632193127": { soloEquipo: true, equipos: { "PERÚ": "PE" } }
};

let registros = {};
let partidas = {};

client.once('clientReady', () => {
  console.log(`🔥 Bot activo como ${client.user.tag}`);
});

// =====================
// 📌 COMANDOS
// =====================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!panel') {
    const btn = new ButtonBuilder()
      .setCustomId('registro')
      .setLabel('🎮 Registrarse')
      .setStyle(ButtonStyle.Primary);

    message.channel.send({
      content: '🔥 Registro',
      components: [new ActionRowBuilder().addComponents(btn)],
    });
  }

  if (message.content === '!match') {
    const btn = new ButtonBuilder()
      .setCustomId('finalizar_partida')
      .setLabel('🏁 Finalizar partida')
      .setStyle(ButtonStyle.Success);

    message.channel.send({
      content: '🎮 Sistema de partidas',
      components: [new ActionRowBuilder().addComponents(btn)],
    });
  }
});

// =====================
// ⚙️ INTERACCIONES
// =====================
client.on('interactionCreate', async (interaction) => {

  try {

    const CONFIG = CONFIGS[interaction.guild?.id];
    if (!CONFIG) return;

    // =====================
    // 🎮 REGISTRO
    // =====================
    if (interaction.isButton() && interaction.customId === 'registro') {

      registros[interaction.user.id] = {};
      let components = [];

      if (CONFIG.soloEquipo) {

        const equipoMenu = new StringSelectMenuBuilder()
          .setCustomId('equipo')
          .setPlaceholder('Selecciona tu país')
          .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label: e, value: e })));

        components.push(new ActionRowBuilder().addComponents(equipoMenu));

      } else {

        const equipoMenu = new StringSelectMenuBuilder()
          .setCustomId('equipo')
          .setPlaceholder('Equipo')
          .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label: e, value: e })));

        const rolMenu = new StringSelectMenuBuilder()
          .setCustomId('rol')
          .setPlaceholder('Rol')
          .addOptions(CONFIG.roles.map(r => ({ label: r, value: r })));

        components.push(
          new ActionRowBuilder().addComponents(equipoMenu),
          new ActionRowBuilder().addComponents(rolMenu)
        );

        if (CONFIG.grupos) {
          const grupoMenu = new StringSelectMenuBuilder()
            .setCustomId('grupo')
            .setPlaceholder('Grupo')
            .addOptions(CONFIG.grupos.map(g => ({ label:`GRUPO ${g}`, value:g })));

          components.push(new ActionRowBuilder().addComponents(grupoMenu));
        }
      }

      return interaction.reply({ content:'Selecciona:', components, ephemeral:true });
    }

    // =====================
    // 🔽 SELECTS
    // =====================
    if (interaction.isStringSelectMenu()) {

      const user = interaction.user.id;

      // MATCH SELECT
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

        return interaction.reply({ content:'Equipo guardado', ephemeral:true });
      }

      // REGISTRO
      registros[user] ??= {};
      registros[user][interaction.customId] = interaction.values[0];

      const data = registros[user];

      if (CONFIG.soloEquipo) {
        if (data.equipo) {
          return abrirModal(interaction);
        }
      } else {
        if (data.equipo && data.rol && (CONFIG.grupos ? data.grupo : true)) {
          return abrirModal(interaction);
        }
      }

      return interaction.reply({ content:'Guardado', ephemeral:true });
    }

    // =====================
    // 🧾 MODAL REGISTRO
    // =====================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_nick') {

      const data = registros[interaction.user.id];
      const nickname = interaction.fields.getTextInputValue('nickname');
      data.nickname = nickname;

      const canal = interaction.guild.channels.cache.find(c => c.name === '📋┃solicitudes');

      const embed = new EmbedBuilder()
        .setTitle('📥 Nueva solicitud')
        .addFields(
          { name:'Usuario', value:`<@${interaction.user.id}>` },
          { name:'Equipo', value:data.equipo },
          ...(data.rol ? [{ name:'Rol', value:data.rol }] : []),
          ...(data.grupo ? [{ name:'Grupo', value:data.grupo }] : []),
          { name:'Nick', value:nickname }
        );

      const aprobar = new ButtonBuilder()
        .setCustomId(`ok_${interaction.user.id}`)
        .setLabel('✅ Aprobar')
        .setStyle(ButtonStyle.Success);

      const rechazar = new ButtonBuilder()
        .setCustomId(`no_${interaction.user.id}`)
        .setLabel('❌ Rechazar')
        .setStyle(ButtonStyle.Danger);

      await canal.send({
        embeds:[embed],
        components:[new ActionRowBuilder().addComponents(aprobar, rechazar)]
      });

      return interaction.reply({ content:'📨 Enviado', ephemeral:true });
    }

    // =====================
    // ✅ APROBAR
    // =====================
    if (interaction.isButton() && interaction.customId.startsWith('ok_')) {

      const id = interaction.customId.split('_')[1];
      const data = registros[id];
      const member = await interaction.guild.members.fetch(id);

      const rolEquipo = interaction.guild.roles.cache.find(r => r.name === data.equipo);
      if (rolEquipo) await member.roles.add(rolEquipo);

      if (!CONFIG.soloEquipo) {
        const rolTipo = interaction.guild.roles.cache.find(r => r.name === data.rol);
        const rolBase = interaction.guild.roles.cache.find(r => r.name === CONFIG.rolBase);

        if (rolTipo) await member.roles.add(rolTipo);
        if (rolBase) await member.roles.add(rolBase);
      }

      const tri = CONFIG.equipos[data.equipo];
      await member.setNickname(`[ ${tri} ] ${data.nickname}`);

      return interaction.update({ content:'✅ Aprobado', components:[], embeds:[] });
    }

    // =====================
    // ❌ RECHAZAR
    // =====================
    if (interaction.isButton() && interaction.customId.startsWith('no_')) {
      return interaction.update({ content:'❌ Rechazado', components:[], embeds:[] });
    }

    // =====================
    // 🏁 MATCH BOTÓN
    // =====================
    if (interaction.isButton() && interaction.customId === 'finalizar_partida') {

      partidas[interaction.user.id] = {};

      const equipo1 = new StringSelectMenuBuilder()
        .setCustomId('match_equipo1')
        .setPlaceholder('Equipo 1')
        .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label:e, value:e })));

      const equipo2 = new StringSelectMenuBuilder()
        .setCustomId('match_equipo2')
        .setPlaceholder('Equipo 2')
        .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label:e, value:e })));

      return interaction.reply({
        content:'Selecciona equipos:',
        components:[
          new ActionRowBuilder().addComponents(equipo1),
          new ActionRowBuilder().addComponents(equipo2)
        ],
        ephemeral:true
      });
    }

    // =====================
    // 🧾 MODAL MATCH
    // =====================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_match') {

      const data = partidas[interaction.user.id];
      const partida = interaction.fields.getTextInputValue('partida');

      const rol1 = interaction.guild.roles.cache.find(r => r.name === data.equipo1);
      const rol2 = interaction.guild.roles.cache.find(r => r.name === data.equipo2);

      const canal = interaction.guild.channels.cache.find(c => c.name === '📢┋notificaciones');
      const cambios = interaction.guild.channels.cache.find(c => c.name === '🔄┋cambios');

      const msg = `📢  **Finaliza la partida ${partida}**
<@&${rol1.id}> VS <@&${rol2.id}>

⏱️ **Comienzan los 5 minutos para realizar cambios.**

_Staffs y suplentes pueden unirse a sus canales de voz._

📌 Reporten cualquier cambio en: ${cambios ? `<#${cambios.id}>` : '#🔄┋cambios'}`;

      await canal.send(msg);

      setTimeout(()=>{
        canal.send('⏱️ **Finaliza el tiempo para realizar cambios**');
      },300000);

      return interaction.reply({ content:'✅ Enviado', ephemeral:true });
    }

  } catch (err) {
    console.error(err);

    if (interaction.isRepliable()) {
      interaction.reply({ content:'❌ Error', ephemeral:true });
    }
  }
});

// =====================
// 🧠 FUNCIONES
// =====================
function abrirModal(interaction){
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

client.login(TOKEN);
