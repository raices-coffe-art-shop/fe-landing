export const contactChannels = {
  whatsappDisplay: "+51 915 123 159",
  whatsappHref: "https://wa.me/51915123159",
  email: "raicescoffeeartshop@gmail.com",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  maps: "https://maps.google.com",
  googleMapsEmbedUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "",
};

export const humanOrigin = {
  eyebrow: "Cómo comenzó",
  title: "Raíces nació del deseo de mantener a Ayacucho cerca.",
  paragraphs: [
    "Raíces fue creado por Francisco Arica y Lized. Ambos comparten un vínculo profundo con Ayacucho y conocen el quechua, una lengua que les permitió acercarse a productores y proveedores de una manera más directa y personal.",
    "Las conversaciones no comenzaron únicamente alrededor de precios o productos. En varios casos, los acuerdos y relaciones se construyeron en quechua, escuchando a las personas, conociendo sus procesos y visitando los lugares donde trabajan.",
    "De esa forma, Raíces empezó a reunir no solo productos de Ayacucho, sino también las historias, familias, conocimientos y formas de trabajo que existen detrás de ellos.",
    "Desde el comienzo, Francisco y Lized decidieron que ningún producto debía presentarse como algo anónimo. Siempre que fuera posible, Raíces debía poder explicar de dónde viene, quién lo produce y qué relación existe con la persona o comunidad que lo hizo posible."
  ],
  founders: "Francisco Arica y Lized",
  foundersPhoto: "/media/people/dina-01.png",
  foundersPhotoAlt: "Francisco Arica y Lized durante una visita de Raíces",
  notes: [
    { label: "Fundadores", text: "Francisco Arica y Lized, fundadores de Raíces." },
    { label: "Lengua", text: "El quechua ha permitido construir conversaciones directas con productores y proveedores de Ayacucho." },
  ],
};

export const communitySection = {
  eyebrow: "Comunidad Raíces",
  title: "Quienes llegan al local también forman parte de su historia.",
  body:
    "Raíces también se construye en las conversaciones, visitas y encuentros que ocurren dentro del espacio. Esta sección reúne momentos compartidos por clientes, familias, invitados y personas que se acercan a conocer sus productos y su propuesta.",
  points: [
    "Visitas: fotografías autorizadas de clientes, familias e invitados.",
    "Voces de la comunidad: testimonios breves, fotografías, audios o videos autorizados.",
    "Actividades: degustaciones, conversatorios, presentaciones, muestras y reuniones.",
    "Feria de artesanos: se publicará cuando tenga fecha y participantes confirmados."
  ],
  future:
    "Con el tiempo, Raíces quiere abrir más espacio para ferias, muestras, conversaciones y actividades que acerquen al público a las personas y expresiones culturales que forman parte del proyecto.",
  statusLabel: "Encuentros en el local",
};
