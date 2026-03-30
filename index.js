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
// 🔥 MONGODB
// =======================
mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 Mongo conectado"))
  .catch(err => console.error(err));

// =======================
// 📦 SCHEMA
// =======================
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
    rolBase: "EWC",
    grupos: ["A","B","C"],
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
  }
};

// =======================
// 🧠 MEMORIA PARTIDAS
// =======================
const partidas = {};

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

    const matchBtn = new ButtonBuilder()
      .setCustomId('finalizar_partida')
      .setLabel('🏁 Finalizar partida')
      .setStyle(ButtonStyle.Secondary);

    message.channel.send({
      content: '🔥 Panel',
      components: [new ActionRowBuilder().addComponents(btn, matchBtn)],
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
    // 🏁 BOTÓN MATCH
    // =======================
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

      const grupo = new StringSelectMenuBuilder()
        .setCustomId('match_grupo')
        .setPlaceholder('Grupo')
        .addOptions(CONFIG.grupos.map(g => ({ label:`GRUPO ${g}`, value:g })));

      return interaction.reply({
        content:'Selecciona datos:',
        components:[
          new ActionRowBuilder().addComponents(equipo1),
          new ActionRowBuilder().addComponents(equipo2),
          new ActionRowBuilder().addComponents(grupo)
        ],
        ephemeral:true
      });
    }

    // =======================
    // 🔽 SELECT MATCH
    // =======================
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('match_')) {

      const userId = interaction.user.id;
      const data = partidas[userId];

      data[interaction.customId.replace('match_', '')] = interaction.values[0];

      // cuando ya tiene todo → abrir modal
      if (data.equipo1 && data.equipo2 && data.grupo) {

        const modal = new ModalBuilder()
          .setCustomId('modal_match')
          .setTitle('Finalizar partida');

        const input = new TextInputBuilder()
          .setCustomId('partida')
          .setLabel('Número de partida')
          .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(input));

        return interaction.showModal(modal);
      }

      return interaction.reply({ content:'Guardado', ephemeral:true });
    }

    // =======================
    // 🧾 MODAL MATCH
    // =======================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_match') {

      const data = partidas[interaction.user.id];
      const partida = interaction.fields.getTextInputValue('partida');

      const rol1 = interaction.guild.roles.cache.find(r => r.name === data.equipo1);
      const rol2 = interaction.guild.roles.cache.find(r => r.name === data.equipo2);
      const rolGrupo = interaction.guild.roles.cache.find(r => r.name === `GRUPO ${data.grupo}`);

      const canal = interaction.guild.channels.cache.find(c => c.name === '📢┋notificaciones');
      const cambios = interaction.guild.channels.cache.find(c => c.name === '🔄┋cambios');

      const msg = `📢 **Finaliza la partida ${partida}**
<@&${rol1?.id}> VS <@&${rol2?.id}>
🎯 ${rolGrupo ? `<@&${rolGrupo.id}>` : ''}

⏱️ **5 minutos para cambios**

📌 Reporten en ${cambios ? `<#${cambios.id}>` : '#cambios'}`;

      await canal.send(msg);

      setTimeout(()=>{
        canal.send('⏱️ **Tiempo terminado**');
      },300000);

      delete partidas[interaction.user.id];

      return interaction.reply({ content:'✅ Anuncio enviado', ephemeral:true });
    }

  } catch (err) {
    console.error(err);

    if (interaction.isRepliable()) {
      interaction.reply({ content:'❌ Error', ephemeral:true });
    }
  }
});

client.login(TOKEN);
