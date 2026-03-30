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
const MONGO_URI = process.env.MONGO_URI;

// =======================
// 🔥 MONGODB
// =======================
mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 Mongo conectado"))
  .catch(err => console.error(err));

// 📦 SCHEMA
const registroSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  equipo: String,
  rol: String,
  grupo: String,
  nickname: String
});

const Registro = mongoose.model("Registro", registroSchema);

// =======================
// ⚙️ CONFIGS
// =======================
const CONFIGS = {

  "1485225770287894530": {
    rolBase: "FFWS",
    grupos: ["A","B","C"],
    roles: ["JUGADOR","COACH","MANAGER","ANALISTA","STAFF"],
    equipos: {
      "MOVISTAR KOI": "KOI",
      "RETA ESPORTS": "RETA",
      "ALL GLORY GAMING": "AGG"
    }
  },

  "1486297664051216445": {
    rolBase: "PUROS CRACKS",
    roles: ["JUGADOR","CAPITAN","COACH","MANAGER","ANALISTA","STAFF"],
    equipos: {
      "ARGENTINA": "AR",
      "CHILE": "CL",
      "COLOMBIA": "CO"
    }
  },

  // 🔴 INDIVIDUALES
  "1486505450064056431": {
    soloEquipo: true,
    equipos: { "ARGENTINA": "AR" }
  }
};

// =======================
// 🚀 READY
// =======================
client.once('clientReady', () => {
  console.log(`🔥 Bot activo como ${client.user.tag}`);
});

// =======================
// 📌 PANEL
// =======================
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
});

// =======================
// ⚙️ INTERACCIONES
// =======================
client.on('interactionCreate', async (interaction) => {

  try {

    const CONFIG = CONFIGS[interaction.guild?.id];
    if (!CONFIG) return;

    // =======================
    // 🎮 REGISTRO
    // =======================
    if (interaction.isButton() && interaction.customId === 'registro') {

      let components = [];

      const equipoMenu = new StringSelectMenuBuilder()
        .setCustomId('equipo')
        .setPlaceholder('Equipo')
        .addOptions(Object.keys(CONFIG.equipos).map(e => ({ label:e, value:e })));

      components.push(new ActionRowBuilder().addComponents(equipoMenu));

      if (!CONFIG.soloEquipo) {

        const rolMenu = new StringSelectMenuBuilder()
          .setCustomId('rol')
          .setPlaceholder('Rol')
          .addOptions(CONFIG.roles.map(r => ({ label:r, value:r })));

        components.push(new ActionRowBuilder().addComponents(rolMenu));

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

    // =======================
    // 🔽 SELECT
    // =======================
    if (interaction.isStringSelectMenu()) {

      const userId = interaction.user.id;

      let data = await Registro.findOne({ userId, guildId: interaction.guild.id });

      if (!data) {
        data = new Registro({ userId, guildId: interaction.guild.id });
      }

      data[interaction.customId] = interaction.values[0];
      await data.save();

      if (CONFIG.soloEquipo) {
        if (data.equipo) return abrirModal(interaction);
      } else {
        if (data.equipo && data.rol && (CONFIG.grupos ? data.grupo : true)) {
          return abrirModal(interaction);
        }
      }

      return interaction.reply({ content:'Guardado', ephemeral:true });
    }

    // =======================
    // 🧾 MODAL
    // =======================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_nick') {

      const userId = interaction.user.id;

      const data = await Registro.findOne({ userId, guildId: interaction.guild.id });

      const nickname = interaction.fields.getTextInputValue('nickname');
      data.nickname = nickname;
      await data.save();

      const canal = interaction.guild.channels.cache.find(c => c.name === '📋┃solicitudes');

      const embed = new EmbedBuilder()
        .setTitle('📥 Nueva solicitud')
        .addFields(
          { name:'Usuario', value:`<@${userId}>` },
          { name:'Equipo', value:data.equipo },
          ...(data.rol ? [{ name:'Rol', value:data.rol }] : []),
          ...(data.grupo ? [{ name:'Grupo', value:data.grupo }] : []),
          { name:'Nick', value:nickname }
        );

      const aprobar = new ButtonBuilder()
        .setCustomId(`ok_${userId}`)
        .setLabel('✅ Aprobar')
        .setStyle(ButtonStyle.Success);

      const rechazar = new ButtonBuilder()
        .setCustomId(`no_${userId}`)
        .setLabel('❌ Rechazar')
        .setStyle(ButtonStyle.Danger);

      await canal.send({
        embeds:[embed],
        components:[new ActionRowBuilder().addComponents(aprobar, rechazar)]
      });

      return interaction.reply({ content:'📨 Enviado', ephemeral:true });
    }

    // =======================
    // ✅ APROBAR
    // =======================
    if (interaction.isButton() && interaction.customId.startsWith('ok_')) {

      const id = interaction.customId.split('_')[1];

      const data = await Registro.findOne({ userId:id, guildId: interaction.guild.id });
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

      await interaction.deferUpdate();
      await interaction.message.edit({
        content:'✅ Aprobado',
        embeds:[],
        components:[]
      });

      await Registro.deleteOne({ userId:id });

      return;
    }

    // =======================
    // ❌ RECHAZAR
    // =======================
    if (interaction.isButton() && interaction.customId.startsWith('no_')) {

      const id = interaction.customId.split('_')[1];

      await Registro.deleteOne({ userId:id });

      await interaction.deferUpdate();
      await interaction.message.edit({
        content:'❌ Rechazado',
        embeds:[],
        components:[]
      });

      return;
    }

  } catch (err) {
    console.error(err);

    if (interaction.isRepliable()) {
      interaction.reply({ content:'❌ Error', ephemeral:true });
    }
  }
});

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
