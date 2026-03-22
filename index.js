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

// 🔥 DEBUG (MUY IMPORTANTE)
console.log("TOKEN:", process.env.TOKEN);

const TOKEN = process.env.TOKEN;

// 🔥 TRICODES
const tricodes = {
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
};

let registros = {};
let solicitudes = {};

client.once('ready', () => {
  console.log(`🔥 Fire Manager PRO (MODAL) activo como ${client.user.tag}`);
});

// 📌 PANEL
client.on('messageCreate', async (message) => {
  if (message.content === '!panel') {

    const boton = new ButtonBuilder()
      .setCustomId('registro')
      .setLabel('🎮 Registrarse')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(boton);

    message.channel.send({
      content: '🔥 **Registro FFWS**\nPresiona el botón para registrarte',
      components: [row],
    });
  }
});

// 🔥 INTERACCIONES
client.on('interactionCreate', async (interaction) => {

  // 🔘 BOTÓN
  if (interaction.isButton()) {
    if (interaction.customId === 'registro') {

      registros[interaction.user.id] = {};

      const equipoMenu = new StringSelectMenuBuilder()
        .setCustomId('equipo')
        .setPlaceholder('Selecciona tu equipo')
        .addOptions(Object.keys(tricodes).map(e => ({
          label: e,
          value: e
        })));

      const rolMenu = new StringSelectMenuBuilder()
        .setCustomId('rol')
        .setPlaceholder('Selecciona tu rol')
        .addOptions([
          { label: 'JUGADOR', value: 'JUGADOR' },
          { label: 'COACH', value: 'COACH' },
          { label: 'MANAGER', value: 'MANAGER' },
          { label: 'ANALISTA', value: 'ANALISTA' },
          { label: 'STAFF', value: 'STAFF' }
        ]);

      const grupoMenu = new StringSelectMenuBuilder()
        .setCustomId('grupo')
        .setPlaceholder('Selecciona tu grupo')
        .addOptions([
          { label: 'GRUPO A', value: 'A' },
          { label: 'GRUPO B', value: 'B' },
          { label: 'GRUPO C', value: 'C' }
        ]);

      await interaction.reply({
        content: '📋 Selecciona tus datos:',
        components: [
          new ActionRowBuilder().addComponents(equipoMenu),
          new ActionRowBuilder().addComponents(rolMenu),
          new ActionRowBuilder().addComponents(grupoMenu)
        ],
        ephemeral: true
      });
    }

    // ✅ APROBAR
    if (interaction.customId.startsWith('aprobar_')) {
      try {
        const userId = interaction.customId.replace('aprobar_', '');
        const data = solicitudes[userId];

        const member = await interaction.guild.members.fetch(userId);

        const rolEquipo = interaction.guild.roles.cache.find(r => r.name === data.equipo);
        const rolBase = interaction.guild.roles.cache.find(r => r.name === 'FFWS');
        const rolTipo = interaction.guild.roles.cache.find(r => r.name === data.rol);
        const rolGrupo = interaction.guild.roles.cache.find(r => r.name === `GRUPO ${data.grupo}`);

        if (rolEquipo) await member.roles.add(rolEquipo);
        if (rolBase) await member.roles.add(rolBase);
        if (rolTipo) await member.roles.add(rolTipo);
        if (rolGrupo) await member.roles.add(rolGrupo);

        await member.setNickname(`[ ${data.tricode} ] ${data.nickname}`);

        delete solicitudes[userId];

        await interaction.reply({ content: '✅ Usuario aprobado', ephemeral: true });

      } catch (err) {
        console.error(err);
        interaction.reply({ content: '❌ Error de permisos', ephemeral: true });
      }
    }

    // ❌ RECHAZAR
    if (interaction.customId.startsWith('rechazar_')) {
      const userId = interaction.customId.replace('rechazar_', '');
      delete solicitudes[userId];

      await interaction.reply({ content: '❌ Rechazado', ephemeral: true });
    }
  }

  // 🔽 SELECT MENUS
  if (interaction.isStringSelectMenu()) {

    const user = interaction.user.id;

    if (!registros[user]) registros[user] = {};

    registros[user][interaction.customId] = interaction.values[0];

    const data = registros[user];

    if (data.equipo && data.rol && data.grupo) {

      const modal = new ModalBuilder()
        .setCustomId('modal_nick')
        .setTitle('Registro FFWS');

      const input = new TextInputBuilder()
        .setCustomId('nickname')
        .setLabel('Escribe tu nickname')
        .setStyle(TextInputStyle.Short);

      const row = new ActionRowBuilder().addComponents(input);

      modal.addComponents(row);

      await interaction.showModal(modal);

    } else {
      await interaction.reply({
        content: '✅ Selección guardada',
        ephemeral: true
      });
    }
  }

  // 🧾 MODAL
  if (interaction.isModalSubmit()) {

    const user = interaction.user.id;
    const data = registros[user];

    const nickname = interaction.fields.getTextInputValue('nickname');

    data.nickname = nickname;
    data.tricode = tricodes[data.equipo];
    data.userId = user;

    solicitudes[user] = data;

    const canal = interaction.guild.channels.cache.find(c => c.name === '📋┃solicitudes');

    const embed = new EmbedBuilder()
      .setTitle('📥 Nueva solicitud')
      .addFields(
        { name: 'Usuario', value: `<@${user}>` },
        { name: 'Equipo', value: data.equipo },
        { name: 'Rol', value: data.rol },
        { name: 'Grupo', value: data.grupo },
        { name: 'Nick', value: nickname }
      );

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprobar_${user}`)
        .setLabel('✅ Aprobar')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`rechazar_${user}`)
        .setLabel('❌ Rechazar')
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({ embeds: [embed], components: [botones] });

    delete registros[user];

    await interaction.reply({
      content: '📩 Solicitud enviada correctamente',
      ephemeral: true
    });
  }
});

// 🔥 CHECK FINAL
if (!TOKEN) {
  console.error("❌ TOKEN NO DETECTADO");
  process.exit(1);
}

client.login(TOKEN);
