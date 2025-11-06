import { MoveDirection, OutMode } from "@tsparticles/engine";

export const colors = [
  "#090040",
  "#0a004d",
  "#090033",
  "#09004c",
  "#471396",
  "#3d1396",
  "#471380",
  "#4713aa",
  "#B13BFF",
  "#b13bf2",
  "#a638f2",
  "#bf53ff",
];

export const particlesOptions = {
  background: {
    color: "#000000",
  },
  fullScreen: {
    enable: true,
  },
  detectRetina: true,
  fpsLimit: 60,
  particles: {
    number: {
      value: 500,
      density: {
        enable: true,
        area: 400,
      },
    },
    color: {
      value: colors,
    },
    shape: {
      type: ["circle", "polygon"],
    },
    opacity: {
      value: { min: 0.5, max: 1 },
      animation: {
        enable: true,
        speed: 0.5,
        minimumValue: 0.5,
        sync: false,
      },
    },
    size: {
      value: { min: 0.5, max: 2.7 },
      animation: {
        enable: true,
        speed: 1,
        minimumValue: 0.5,
        sync: false,
      },
    },
    move: {
      enable: true,
      speed: 1,
      direction: MoveDirection.none,
      random: true,
      straight: false,
      outModes: {
        default: OutMode.destroy,
      },
      trail: {
        enable: false,
        length: 10,
        fill: {
          color: "#000", // o un degradado espacial
        },
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: ["slow", "attract"],
      },
      onClick: {
        enable: true,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 300,
        duration: 8,
        speed: 10, // Velocidad de repulsión
      },
      attract: {
        distance: 200, // Distancia máxima para conectar partículas con líneas
        radius: 50, // Radio alrededor del puntero para detectar partículas
        speed: 0.4, // Duración de la atracción
      },
    },
  },
  emitters: {
    direction: "none",
    rate: {
      quantity: 50,
      delay: 0.1,
    },
    size: {
      width: 0,
      height: 0,
    },
    position: {
      x: 50,
      y: 50,
    },
  },
};

export const showLandingPackages = false;

export const landingPackages = [
  {
    name: "PYMES | Unipersonal",
    price: "$ 4.990",
    delivery: "3-5 días (hábiles)",
    features: [
      "Diseño adaptativo a todos los dispositivos",
      "SEO básico (optimización de Google)",
      "Formulario de contacto y redirección a WhatsApp",
      "Exposición de proyectos y servicios",
      "Revisiones mensuales (2 incluidas)",
    ],
  },
  {
    name: "Empresas",
    price: "$14.990",
    delivery: "14-24 días (hábiles)",
    features: [
      "Todo lo incluido en PYMES",
      "Integración CRM (Modificación en tiempo real)",
      "Analiticas de tráfico y volúmen avanzado",
      "Integración con Meta y Mailchimp para campañas",
      "3 revisiones incluidas",
      "Chat en vivo",
    ],
    popular: true,
  },
  {
    name: "Corporativo | E-commerce",
    price: "$24.990",
    delivery: "7-10 días",
    features: [
      "Todo lo del Pro",
      "Automatización completa",
      "Multi-idioma",
      "PWA (App móvil)",
      "Revisiones ilimitadas",
      "Soporte 30 días",
    ],
  },
];

export const botPackages = [
  {
    name: "Básico",
    price: "---",
    delivery: "2-3 días",
    features: [
      "Respuestas automáticas",
      "Menú interactivo",
      "Horarios de atención",
      "Hasta 50 conversaciones/mes",
    ],
  },
  {
    name: "Avanzado",
    price: "---",
    delivery: "3-5 días",
    features: [
      "Todo lo del Básico",
      "IA conversacional",
      "Integración CRM",
      "Análisis de conversaciones",
      "Hasta 200 conversaciones/mes",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "---",
    delivery: "5-7 días",
    features: [
      "Todo lo del Avanzado",
      "IA personalizada",
      "Múltiples idiomas",
      "Integración e-commerce",
      "Conversaciones ilimitadas",
      "Soporte prioritario",
    ],
  },
];

export const partners = [
  "Shopify",
  "MercadoPago",
  "Meta",
  "Google Analytics",
  "Calendly",
  "Stripe",
  "Zapier",
  "HubSpot",
];

export const processSteps = [
  {
    title: "Branding Estratégico",
    icon: "lightbulb" as const,
    description:
      "Creamos una identidad sólida para tu marca que conecte con tu audiencia objetivo",
  },
  {
    title: "Diseño UX/UI",
    icon: "pencil" as const,
    description:
      "Prototipos únicos que priorizan la conversión y la experiencia del usuario",
  },
  {
    title: "Desarrollo Adaptativo",
    icon: "code" as const,
    description:
      "Frontend y backend optimizados para rendimiento y escalabilidad",
  },
  {
    title: "Optimización SEO",
    icon: "magnifying-glass" as const,
    description:
      "Mejoramos tu presencia en buscadores con técnicas avanzadas de SEO",
  },
  {
    title: "Integración con Analytics y CRM",
    icon: "chart-bar" as const,
    description:
      "Medimos, analizamos y conectamos todas las herramientas necesarias",
  },
  {
    title: "Lanzamiento & Monitoreo",
    icon: "rocket-launch" as const,
    description:
      "Publicamos y monitoreamos tu web para garantizar el éxito continuo",
  },
];
