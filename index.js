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

// 📌 PANEL
client.on('messageCreate', async (message) => {
  if (message.content === '!panel') {

    const boton = new ButtonBuilder()
      .setCustomId('registro')
      .setLabel('🎮 Registrarse')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(boton);

    message.channel.send({
      content: '🔥 **Registro**\nPresiona el botón para registrarte',
      components: [row],
    });
  }
});

// 🔥 INTERACCIONES
client.on('interactionCreate', async (interaction) => {

  const guildId = interaction.guild?.id;
  const CONFIG = CONFIGS[guildId];

  if (!CONFIG) {
    if (interaction.isRepliable()) {
      return interaction.reply({
        content: "❌ Este servidor no está configurado",
        ephemeral: true
      });
    }
    return;
  }

  // 🔘 BOTÓN
  if (interaction.isButton()) {
    if (interaction.customId === 'registro') {

      registros[interaction.user.id] = {};

      const equipoMenu = new StringSelectMenuBuilder()
        .setCustomId('equipo')
        .setPlaceholder('Selecciona tu equipo')
        .addOptions(
          Object.keys(CONFIG.equipos).map(e => ({
            label: e,
            value: e
          }))
        );

      const rolMenu = new StringSelectMenuBuilder()
        .setCustomId('rol')
        .setPlaceholder('Selecciona tu rol')
        .addOptions(
          CONFIG.roles.map(r => ({
            label: r,
            value: r
          }))
        );

      let componentes = [
        new ActionRowBuilder().addComponents(equipoMenu),
        new ActionRowBuilder().addComponents(rolMenu)
      ];

      if (CONFIG.grupos) {
        const grupoMenu = new StringSelectMenuBuilder()
          .setCustomId('grupo')
          .setPlaceholder('Selecciona tu grupo')
          .addOptions(
            CONFIG.grupos.map(g => ({
              label: `GRUPO ${g}`,
              value: g
            }))
          );

        componentes.push(new ActionRowBuilder().addComponents(grupoMenu));
      }

      await interaction.reply({
        content: '📋 Selecciona tus datos:',
        components: componentes,
        ephemeral: true
      });
    }

    // ✅ APROBAR
    if (interaction.customId.startsWith('aprobar_')) {
      try {
        const userId = interaction.customId.replace('aprobar_', '');
        const data = solicitudes[userId];

        if (!data) {
          return interaction.reply({
            content: '❌ Datos no encontrados',
            ephemeral: true
          });
        }

        const member = await interaction.guild.members.fetch(userId);

        const rolEquipo = interaction.guild.roles.cache.find(r => r.name === data.equipo);
        const rolBase = interaction.guild.roles.cache.find(r => r.name === CONFIG.rolBase);
        const rolTipo = interaction.guild.roles.cache.find(r => r.name === data.rol);

        let rolGrupo = null;
        if (CONFIG.grupos) {
          rolGrupo = interaction.guild.roles.cache.find(
            r => r.name === `GRUPO ${data.grupo}`
          );
        }

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

    if (
      data.equipo &&
      data.rol &&
      (CONFIG.grupos ? data.grupo : true)
    ) {

      const modal = new ModalBuilder()
        .setCustomId('modal_nick')
        .setTitle('Registro');

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

    if (!data) {
      return interaction.reply({
        content: '❌ Error de registro',
        ephemeral: true
      });
    }

    const nickname = interaction.fields.getTextInputValue('nickname');

    data.nickname = nickname;
    data.tricode = CONFIG.equipos[data.equipo];
    data.userId = user;

    solicitudes[user] = data;

    const canal = interaction.guild.channels.cache.find(c => c.name === '📋┃solicitudes');

    if (!canal) {
      return interaction.reply({
        content: '❌ Canal de solicitudes no encontrado',
        ephemeral: true
      });
    }

    const fields = [
      { name: 'Usuario', value: `<@${user}>` },
      { name: 'Equipo', value: data.equipo },
      { name: 'Rol', value: data.rol }
    ];

    if (CONFIG.grupos) {
      fields.push({ name: 'Grupo', value: data.grupo });
    }

    fields.push({ name: 'Nick', value: nickname });

    const embed = new EmbedBuilder()
      .setTitle('📥 Nueva solicitud')
      .addFields(fields);

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

if (!TOKEN) {
  console.error("❌ TOKEN NO DETECTADO");
  process.exit(1);
}

client.login(TOKEN);
