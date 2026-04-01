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

const mongoose = require('mongoose');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = process.env.TOKEN;
const MONGO_URI = process.env.MONGO_URI;

// =======================
// 🔥 MONGO
// =======================
mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 Mongo conectado"))
  .catch(err => console.error(err));

const registroSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  equipo: String,
  rol: String,
  grupo: String,
  nickname: String,
  estado: { type: String, default: "pendiente" }
});

const Registro = mongoose.model("Registro", registroSchema);

// =======================
// ⚙️ CONFIG
// =======================
const CONFIGS = {
  "1485225770287894530": {
    rolBase: "EWC",
    grupos: ["GRUPO A", "GRUPO B", "GRUPO C"],
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
  "1219724901456547961":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "9z GLOBANT": "9zG"}
  },
  "1219725041126867075":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "ALL GLORY GAMERHOOD": "AGG"}
  },
  "1219727997205090394":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "BLUE CHEESE": "BC"}
  },
  "1219728063248732180":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "CACM ESPORTS": "CACM"}
  },
  "1219728327372312646":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "CHILL ESPORTS": "CHL"}
  },
  "1219727531197075466":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "ESTORM DRK": "ESG"}
  },
  "1219728219003944970":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "FD QUISQUEYA": "QFD"}
  },
  "1219728272737439865":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "FLORIDA FLF": "FLF"}
  },
  "1219728368665104405":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "FUEGO": "FGO"}
  },
  "1219727383549055188":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "GUN DYNASTY": "GD"}
  },
  "1219728167686635620":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "HNS ESPORTS": "HNS"}
  },
  "1219727723002466484":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "INFINITY E-SPORTS": "INF"}
  },
  "1219727926044655686":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "LEVIATÁN": "LEV"}
  },
  "1219727649115602995":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "LMG ESPORT": "LMG"}
  },
  "1219728115287461901":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "LYON": "LYON"}
  },
  "1219727862714601573":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "MONOUGG": "MGG"}
  },
  "1219727789213614081":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "MOVISTAR KOI": "KOI"}
  },
  "1219727308571803678":{
    soloEquipo: true,
    guardarRolInfo: true,
    equipos: { "NOVA LEGION": "NVL"}
  },
};

let registros = {};
let solicitudes = {};
let partidas = {};

// =======================
client.once('clientReady', () => {
  console.log(`🔥 Bot activo como ${client.user.tag}`);
});

// =======================
// 📌 COMANDOS
// =======================
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

// =======================
// 🔥 INTERACCIONES
// =======================
client.on('interactionCreate', async (interaction) => {
  try {

    const guildId = interaction.guild?.id;
    const CONFIG = CONFIGS[guildId];
    if (!CONFIG) return;

    // =======================
    // ✅ BOTONES (MONGO)
    // =======================
    if (interaction.isButton() && interaction.customId.startsWith('ok_')) {

      const id = interaction.customId.split('_')[1];

      const data = await Registro.findOne({ userId: id, guildId: interaction.guild.id });

      if (!data) {
        return interaction.reply({ content: '❌ No encontrado en DB', ephemeral: true });
      }

      let member;
      try{
        member = await interaction.guild.members.fetch(id);
      }catch{
        return interaction.reply({content:'❌ Usuario no encontrado',
          ephemeral: true });
    }
      const rolEquipo = interaction.guild.roles.cache.find(r => r.name === data.equipo);

      const rolTipo = data.rol
        ? interaction.guild.roles.cache.find(r => r.name === data.rol)
        : null;

      const rolBase = CONFIG.rolBase
        ? interaction.guild.roles.cache.find(r => r.name === CONFIG.rolBase)
        : null;

      if (rolEquipo) await member.roles.add(rolEquipo);

      // 🔥 ahora SIEMPRE aplica rol si existe
      if (rolTipo) {
        try{
          await member.roles.add(rolTipo);
        }catch (err){
          console.log('⚠️ No se pudo asignar equipo:', data.equipo);
        }
      }

      // 🔥 solo EWC tiene rol base
      if (!CONFIG.soloEquipo && rolBase) {
        await member.roles.add(rolBase);
    }

      const tri = CONFIG.equipos[data.equipo] || data.equipo;

      if (data.nickname){
        await member.setNickname(`[ ${tri} ] ${data.nickname}`).catch(()=>{});
      }

      data.estado = "aprobado";
      await data.save();

      const staff = interaction.user.username;

      await interaction.deferUpdate();

      await interaction.message.edit({
        content: `✅ [ ${tri} ] ${data.nickname} aprobado por ${staff}`,
        embeds: [],
        components: []
      });

      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('no_')) {

      const id = interaction.customId.split('_')[1];

      await Registro.updateOne(
        { userId: id, guildId: interaction.guild.id },
        { estado: "rechazado" }
      );

      await interaction.deferUpdate();
      
      await interaction.message.edit({
        content: '❌ Rechazado',
        embeds: [],
        components: []
      });

      return;
    }

// =======================
// 🎮 REGISTRO
// =======================
if (interaction.isButton() && interaction.customId === 'registro') {

  registros[interaction.user.id] = {};

  let components = [];

  // ✅ EQUIPO (siempre)
  const equipoMenu = new StringSelectMenuBuilder()
    .setCustomId('equipo')
    .setPlaceholder('Equipo')
    .addOptions(Object.keys(CONFIG.equipos).map(e => ({
      label: e,
      value: e
    })));

  components.push(
    new ActionRowBuilder().addComponents(equipoMenu)
  );

  // ✅ ROL (solo si aplica o guardar info)
  if (!CONFIG.soloEquipo || CONFIG.guardarRolInfo) {

    const rolesDisponibles = CONFIG.roles || [
      "JUGADOR",
      "COACH",
      "MANAGER",
      "ANALISTA",
      "STAFF"
    ];

    const rolMenu = new StringSelectMenuBuilder()
      .setCustomId('rol')
      .setPlaceholder('Rol')
      .addOptions(rolesDisponibles.map(r => ({
        label: r,
        value: r
      })));

    components.push(
      new ActionRowBuilder().addComponents(rolMenu)
    );
  }

  // ✅ GRUPOS (solo si existen)
  if (CONFIG.grupos) {
    const grupoMenu = new StringSelectMenuBuilder()
      .setCustomId('grupo')
      .setPlaceholder('Grupo')
      .addOptions(CONFIG.grupos.map(g => ({
        label: `GRUPO ${g}`,
        value: g
      })));

    components.push(
      new ActionRowBuilder().addComponents(grupoMenu)
    );
  }

  return interaction.reply({
    content: 'Selecciona:',
    components,
    ephemeral: true
  });
}
// =======================
// 🏁 PARTIDA
// =======================
if (interaction.isButton() && interaction.customId === 'finalizar_partida') {

  partidas[interaction.user.id] = {};

  // 🔥 opciones (equipos + grupos)
  const opciones = [
    ...Object.keys(CONFIG.equipos).map(e => ({
      label: e,
      value: e
    })),

    ...(CONFIG.grupos || []).map(g => ({
      label: `GRUPO ${g}`,
      value: `GRUPO ${g}`
    }))
  ];

  const equipo1Menu = new StringSelectMenuBuilder()
    .setCustomId('match_equipo1')
    .setPlaceholder('Equipo / Grupo 1')
    .addOptions(opciones);

  const equipo2Menu = new StringSelectMenuBuilder()
    .setCustomId('match_equipo2')
    .setPlaceholder('Equipo / Grupo 2')
    .addOptions(opciones);

  return interaction.reply({
    content: 'Selecciona equipos o grupos:',
    components: [
      new ActionRowBuilder().addComponents(equipo1Menu),
      new ActionRowBuilder().addComponents(equipo2Menu)
    ],
    ephemeral: true
  });
}

    // =======================
    // 🔽 SELECTS
    // =======================
    if (interaction.isStringSelectMenu()) {

      const user = interaction.user.id;

      // MATCH
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

      // REGISTRO
      registros[user] ??= {};
      registros[user][interaction.customId] = interaction.values[0];

      const data = registros[user];

      const tieneEquipo = !!data.equipo;
      const tieneRol = !!data.rol;
      const tieneGrupo = CONFIG.grupos ? !!data.grupo : true;

      if (tieneEquipo && tieneRol && tieneGrupo){

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

      return interaction.deferUpdate();
    }

    // =======================
    // 🧾 MODAL REGISTRO
    // =======================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_nick') {

      const user = interaction.user.id;
      const data = registros[user];

      if (!data) {
        return interaction.reply({ content: 'Error', ephemeral: true });
      }

      const nickname = interaction.fields.getTextInputValue('nickname');

      await Registro.create({
        userId: user,
        guildId: interaction.guild.id,
        equipo: data.equipo,
        rol: data.rol,
        grupo: data.grupo,
        nickname,
        estado: "pendiente"
      });

      const canal = interaction.guild.channels.cache.find(c => c.name === '📋┃solicitudes');

      const embed = new EmbedBuilder()
        .setTitle('📥 Nueva solicitud')
        .addFields(
          { name: 'Usuario', value: `<@${user}>` },
          { name: 'Equipo', value: data.equipo },
          { name: 'Rol', value: data.rol || 'No especificado' },
          ...(data.grupo ? [{ name: 'Grupo', value: data.grupo }] : []),
          { name: 'Nick', value: nickname }
        );

      const aprobar = new ButtonBuilder()
        .setCustomId(`ok_${user}`)
        .setLabel('✅ Aprobar')
        .setStyle(ButtonStyle.Success);

      const rechazar = new ButtonBuilder()
        .setCustomId(`no_${user}`)
        .setLabel('❌ Rechazar')
        .setStyle(ButtonStyle.Danger);

      if (canal) {
        await canal.send({
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(aprobar, rechazar)]
        });
      }

      delete registros[user];

      return interaction.reply({ content: '📨 Enviado', ephemeral: true });
    }

    // =======================
    // 🏁 MODAL PARTIDA
    // =======================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_match') {

      const user = interaction.user.id;
      const data = partidas[user];

      if (!data) {
        return interaction.reply({ content: 'Error', ephemeral: true });
      }

      const partida = interaction.fields.getTextInputValue('partida');

      const rol1 = interaction.guild.roles.cache.find(r => r.name === data.equipo1);
      const rol2 = interaction.guild.roles.cache.find(r => r.name === data.equipo2);

      if (!rol1 || !rol2) {
        return interaction.reply({
          content: '❌ Roles no encontrados',
          ephemeral: true
        });
      }

      const canalNotificaciones = interaction.guild.channels.cache.find(c => c.name === '📢┋notificaciones');
      const canalCambios = interaction.guild.channels.cache.find(c => c.name === '🔄┋cambios');

      if (!canalNotificaciones) {
        return interaction.reply({
          content: '❌ Canal de notificaciones no existe',
          ephemeral: true
        });
      }

      const msg = `📢  **Finaliza la partida ${partida}**
<@&${rol1.id}> VS <@&${rol2.id}>  

⏱️ **Comienzan los 5 minutos para realizar cambios.**

_Staffs y suplentes pueden unirse a sus canales de voz._

📌 Reporten cualquier cambio en el canal: ${canalCambios ? `<#${canalCambios.id}>` : '#🔄┋cambios'}`;

      await canalNotificaciones.send(msg);

      await interaction.reply({ content: '✅ Enviado', ephemeral: true });

      setTimeout(() => {
        canalNotificaciones.send('⏱️ **Finaliza el tiempo para realizar cambios**');
      }, 300000);

      delete partidas[user];
    }

  } catch (err) {
    console.error(err);

    if (interaction.isRepliable()) {
      interaction.reply({
        content: '❌ Error interno',
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);
